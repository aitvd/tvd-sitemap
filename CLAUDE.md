# Project notes

## Dentrix report automation context

The office runs **Dentrix version 25.21.2.45922** (all modules on the same build,
confirmed via Help → About Dentrix, June 2026). This is a modern release — newer
than the legacy G5 builds associated with CVE-2012-4952.

Goal under exploration: extract Dentrix reports without desktop/UI automation.
Candidate paths:
- **Reports & Tasks Scheduler** — schedules report generation but only queues output
  in the Batch Processor (still needs a manual export step). Not fully hands-off.
- **ODBC / Dentrix Developer Program** — sanctioned per-install credential
  (`RegisterUser` → `GetConnectionString`) for direct queries against the FairCom
  c-tree database. Preferred path for an unattended pipeline.
- **"Run HSD Export"** (native button in About/utility screen) — worth evaluating
  as another native export option.

Sensitive identifiers (serial number, customer ID, any DB credentials) are
intentionally NOT stored in this repo.
