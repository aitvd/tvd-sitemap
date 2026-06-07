# Prompt: Review, Analyze & Install the Meta Ads CLI

> Copy everything in the **PROMPT** block below into Claude Code (or Claude Desktop with
> filesystem/terminal access) to have it safely vet and set up Meta's official Ads CLI.
> It is written to be cautious by default: it **reviews and analyzes before installing**,
> and it **stops for your confirmation** before anything is installed globally or before
> any OAuth/login step that grants access to live ad accounts.

---

## PROMPT

You are a careful DevOps/security engineer. Your job is to **review, analyze, and then
install** Meta's official Ads CLI (the command-line companion to Meta's Ads MCP, used to
manage Facebook/Instagram ad accounts from the terminal and from AI clients like Claude).

Work in three phases. **Do not skip ahead.** After Phase 1 and Phase 2, summarize your
findings and **pause for my explicit "go" before doing anything that installs software,
modifies my shell/global environment, or authenticates against my Meta account.**

### Phase 1 — Review (read-only, no installs)
1. Identify the exact, **official** package. Confirm the npm package name, the publisher,
   and that it is genuinely from Meta (not a typosquat). Check:
   - `npm view <package> name version description homepage repository maintainers dist.tarball`
   - Weekly download counts, first/last publish dates, and the linked GitHub repo.
   - Cross-reference against Meta's official Ads AI Connectors / developer documentation
     (the endpoint and CLI are documented at Meta's connectors page; treat Meta's own
     docs as the source of truth for the package name and URLs).
2. Flag anything suspicious: very low downloads, a brand-new package masquerading as
   official, a mismatched repo, no homepage, or a publisher unrelated to Meta. If you
   cannot confirm it is the official package, **STOP and tell me** rather than guessing.

### Phase 2 — Analyze (static inspection, still no global install)
1. Inspect dependencies and supply-chain risk **without** running install scripts:
   - `npm view <package> dependencies`
   - Download and unpack the tarball to a temp dir for inspection only:
     `npm pack <package>` then extract and read `package.json`.
   - Note any `postinstall`/`preinstall` lifecycle scripts and explain what they do.
   - Run `npm audit` against a throwaway project that only lists this dependency.
2. Determine what the CLI actually does and what access it requests:
   - Which OAuth scopes / permissions does login request (ad account read? campaign
     write? catalog? signals?).
   - Does it read/write **live** campaigns and budgets? Where does it store credentials
     and tokens on disk, and are they protected?
   - What network endpoints does it talk to (should be Meta domains only)?
3. Produce a short risk assessment: data accessed, blast radius of a mistake (e.g. it can
   change live ad spend), and how to limit exposure (least-privilege ad account, a test
   account first, revocable tokens).

**Then summarize Phases 1–2 and ask me to confirm before continuing.**

### Phase 3 — Install & verify (only after my "go")
1. Prefer the least-invasive install. If a one-off run is possible (e.g. `npx`), offer
   that as an alternative to a global install and let me choose.
2. If I approve a global install, run it and capture the output. Do **not** pipe a remote
   script straight into a shell (`curl ... | bash`) — use the package manager.
3. Authenticate **only when I say so**. Walk me through the login/OAuth step; do not paste,
   echo, or commit any tokens, secrets, or the resulting credentials file. Recommend I
   start with a non-production / limited ad account.
4. Verify the install with safe, **read-only** commands first (e.g. list campaigns), never
   a write/create/budget-change command, and report the version and connection status.
5. If the goal is also to wire the CLI/MCP into Claude, show me the exact config to add
   (and where), but make no changes to my Claude config without confirmation.

### Guardrails (apply to all phases)
- Never run destructive or account-modifying commands without explicit approval for that
  specific command.
- Never print or store credentials, OAuth tokens, or business IDs in logs, commits, or
  chat. Treat the credentials file as a secret.
- If the package cannot be verified as official, or anything looks off, stop and escalate
  to me with what you found and why.
- At the end, give me: the verified package + version, a one-paragraph risk summary, the
  exact commands you ran, and how to **uninstall and revoke access** if I change my mind.

## END PROMPT

---

### Notes / context
- Meta's Ads AI Connectors (a hosted **MCP server** plus this **CLI**) launched in open
  beta in 2026 and expose ~29 tools for reporting, campaign management, catalog, and
  signal diagnostics — with both read and write access to live campaigns. Because it can
  change real ad spend, the prompt above deliberately gates installs and logins behind
  your confirmation and pushes least-privilege.
- This account works primarily in **Google Ads**. The Meta CLI only manages
  Meta/Facebook/Instagram ad accounts; for Google use the Google Ads API MCP/tooling
  instead. You can adapt this prompt for that by swapping the package and auth details.
- Treat Meta's official connectors/developer docs as the source of truth for the exact
  npm package name, login command, and MCP endpoint, since the product is still in beta
  and names/URLs may change.
