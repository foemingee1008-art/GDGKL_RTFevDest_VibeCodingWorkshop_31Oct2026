# Log In Sentinel Dashboard

Tactical Security Operations Center (SOC) Authentication Telemetry & Explainable AI Threat Detection Dashboard, created from Stitch Project `11875454423807037070` (**Log In Sentinel Dashboard**).

## Project Structure

- `index.html` — Full interactive **Log In Sentinel Dashboard** with all 6 navigation tabs (`Overview`, `Logs`, `Threats`, `Alerts`, `IP Trace`, `Config`), interactive SVG telemetry velocity chart (`1h`, `6h`, `24h`, `7d`), Explainable AI Sentinel triage panel (`Block & Isolate` / `Dismiss / Trust`), Incident Forensic Modal, `⌘K` Command Palette, and PCAP/JSON telemetry export.
- `stitch-overview.html` — Unmodified reference export of the `Security Overview` screen (`28db595ff8694f64b22a79a6d3f8f394`) from Stitch.
- `DESIGN.md` — The complete **Log In Sentinel** design system specification (dark-first SOC palette, `Inter` + `JetBrains Mono` dual-engine typography, elevation & tactical glow rules).
- `js/data.js` — Telemetry time-series curves, AI correlation rules (`RULE-AUTH-04`, `RULE-GEO-09`, `RULE-MFA-02`), priority incidents, raw authentication logs, and IP threat intelligence dossiers.
- `js/app.js` — Interactive application controller, live stream simulator, SIEM KQL filter, command palette, and containment actions.
- `server.js` — Zero-dependency Node.js static HTTP server.

## Running Locally

You can open `index.html` directly in any browser, or run the local server:

```powershell
node server.js
```

Then visit `http://localhost:3000`.
