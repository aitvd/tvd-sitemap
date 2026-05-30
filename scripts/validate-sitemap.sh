#!/usr/bin/env bash
# Validate sitemap.xml: well-formed XML + every <loc> returns 200 under a Googlebot UA.
# Optionally (--check-live) confirm the live GitHub Pages copy matches the repo.
# Exits non-zero on any failure so CI fails loudly.
set -uo pipefail

UA="Googlebot/2.1 (+http://www.google.com/bot.html)"
SITEMAP="${SITEMAP:-sitemap.xml}"
LIVE_URL="https://aitvd.github.io/tvd-sitemap/sitemap.xml"
fail=0

echo "== 1. XML well-formed =="
if python3 -c "import xml.dom.minidom; xml.dom.minidom.parse('$SITEMAP')" 2>/dev/null; then
  n=$(grep -c '<loc>' "$SITEMAP")
  echo "  ok: valid XML, $n <loc> entries"
else
  echo "  FAIL: $SITEMAP is not well-formed XML"
  exit 1
fi

echo "== 2. Every <loc> returns 200 (Googlebot UA, no redirects) =="
while read -r url; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -A "$UA" --max-time 20 "$url")
  if [ "$code" != "200" ]; then
    redir=$(curl -s -o /dev/null -A "$UA" -w "%{redirect_url}" --max-time 20 "$url")
    echo "  FAIL  $code  $url  ${redir:+-> $redir}"
    fail=$((fail+1))
  fi
done < <(grep '<loc>' "$SITEMAP" | sed -E 's/.*<loc>(.*)<\/loc>.*/\1/')
[ "$fail" -eq 0 ] && echo "  ok: all entries 200" || echo "  $fail entry/entries not canonical 200"

if [ "${1:-}" = "--check-live" ]; then
  echo "== 3. Live GitHub Pages == repo =="
  if diff <(curl -s -A "$UA" --max-time 20 "$LIVE_URL") "$SITEMAP" >/dev/null 2>&1; then
    echo "  ok: live matches repo"
  else
    echo "  WARN: live GitHub Pages differs from repo (merge/deploy pending?)"
    fail=$((fail+1))
  fi
fi

[ "$fail" -eq 0 ] && { echo "PASS"; exit 0; } || { echo "FAILED ($fail issue(s))"; exit 1; }
