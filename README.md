# Passive Income Field Guide

An India-first review of 15 passive earning app candidates, dated **November 17, 2026**. Includes exclusions and unresolved leads rather than presenting every candidate as an endorsement.

Open `index.html` in a browser. The public site uses GitHub Pages, no build service, no analytics, no account collection and no external frontend dependencies.

## Findings

No verified evidence supports a guaranteed ₹30,000/month floor from a single ordinary India household setup. Earnings depend on demand, eligibility, hardware, withdrawals and costs. Gift cards, speculative points, prize draws and unpaid dashboard balances are not cash received.

Start with one documented bandwidth pilot; investigate GPU compute only on suitable existing hardware. Some research opportunities require real phones and invitations. Everything cannot legitimately be reproduced inside Windows emulators.

## Contents

- `index.html`: complete static research guide with sources, 15 app cards, calculator and seven-day plan.
- `apps.json`: structured app comparison; status and uncertainty are explicit.
- `site.css`, `site.js`: accessible responsive presentation, filtering and illustrative calculator.
- `build.cjs`: regenerates the static page from `apps.json` and `page.html`.
- `check.cjs`: structural/data and calculator checks (`node check.cjs`).
- `pilot-log.csv`: empty local earnings ledger. Keep personal entries outside the public repository.
- `android-pilot.html`: one-account guide for three Android phones on separate native SIM connections, with carrier-IP checks and a seven-day measurement plan.
- `account-pilot-log.csv`, `device-pilot-log.csv`: separate blank ledgers to avoid counting a shared account balance once per phone.
- `internet-income-plan.html`: full self-service handbook with 16 sections, provider playbooks, target scenarios, troubleshooting, a 30-day plan and a separate optional active-work fallback.
- `handbook.js`, `handbook.css`: standalone net-target calculator and handbook presentation. Numeric checks: `node handbook-check.cjs`.

Rebuild after editing: `node build.cjs`. No package installation required.

## Research standard

Provider pages were checked through direct HTTPS retrieval on the research date. The web-search interface returned blank output, so this guide does not rely on search snippets or fabricated citations. Links identify the exact provider sources. A source being reachable does not prove payouts, app safety or India admission. Inaccessible pages are marked unverified. Conflicting provider statements remain visible. No accounts, payments or downloads were independently tested.

Claims are provider statements, not independent payout endorsements. Rate scenarios are arithmetic, not forecasts. Country and reward rules may change after the review date. This is a researched shortlist, not an exhaustive survey of every app or a verified earnings maximum.

Follow-up checks: Android Honeygain uses one account across eligible connections; separate SIMs can share a carrier public IP, and mobile tethering is prohibited. MobileXpression requires weekly manual credit claims within seven days. Viewpoints and MobileXpression do not establish triple rewards for one person with three phones. The Android pilot links current provider rules and keeps personal device diagnostics outside this repository.

Expanded research: ByteLixir's published mobile rate and crypto threshold are now documented; EarnFM specifically excludes cellular-only sharing. Repocket Windows downloads are verified, while its India/Android economics remain conditional. The handbook adds ProxyRack Peer (official India/Android evidence), plus Bitping and MystNodes as conditional/advanced alternatives beyond the original 15 entries. No rate establishes buyer demand. The default capacity model treats 300 GB/day as aggregate, with clearly illustrative FX and editable costs.

No passwords, OTPs, wallet secrets, personal hardware details, full copyrighted source dumps, affiliate links or credentials are included. The page contains no installation automation or geographic/account evasion instructions. Setup requires local sign-in and informed consent to the chosen provider's data/network use.
