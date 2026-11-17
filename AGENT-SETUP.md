# PC income setup: instructions for an agent

Read the complete PC runbook at `pc-agent.html`, the provider records in `pc-catalog.json`, and the income caveats before changing the machine. This is an operational setup brief, not a promise of wages. Research date: 17 November 2026.

## Desired outcome

1. Inspect the PC and connection.
2. Select eligible candidates; rank a single first pilot.
3. Obtain the current official installer and inspect its signature/publisher.
4. Install the selected client through its normal installer if authorized and verified.
5. Let the owner sign in, complete identity/payment setup, read permissions and consent, and enable sharing themselves.
6. Serve `dashboard.html` locally and document status accurately.
7. Measure a stable observation window, test withdrawal, report net income and target gap.

Do not interpret “install everything” as permission to accept every app's terms, submit personal information or run incompatible/background proxy clients together. The catalog contains passive and active alternatives; many will be ineligible or unnecessary. Work through them and explain decisions. Do not fabricate installations, Sharing status, API integration, project acceptance or payouts.

## Local workspace

Clone/download this repository into a dedicated folder. Do not initialize a repository in the user's home directory. Read local AGENTS.md instructions. Preserve user changes. `private/` is gitignored; store inventories, download receipts, binaries and personal dashboard exports there. No credentials, identifiers or balances belong in public commits.

For a portable copy, download `downloads/pc-income-kit.zip` and its SHA256 manifest, verify the archive, then extract ALL files into a dedicated new folder. Do not run a file directly inside the ZIP. `start.cmd` opens the local dashboard using the helper without installing a provider. The portable kit includes this brief, detailed active-work playbooks and all browser assets. It contains no personal inventory, provider binaries or saved balances. The downloadable archive itself is not nested inside its own contents: package-download links on a local copy refer to the public site, while source checkouts can rebuild with `package-kit.ps1`. The manifest is a build-integrity check, not a code-signing claim.

Windows PowerShell 5.1+ is enough for the helper; Node is needed only for development checks and regenerating catalog JS, not ordinary dashboard use. Do not install a package manager/framework merely to open this static dashboard.

```powershell
# In the downloaded repository, after reading the script:
.\setup-pc.ps1 -Action Audit -Connection Unknown
.\setup-pc.ps1 -Action Prepare -Connection Tethered
.\setup-pc.ps1 -Action Serve -OpenBrowser
```

If local execution policy blocks a downloaded script, inspect it and its origin, then use the user's normal reviewed-script workflow. Do not change machine-wide execution policy or disable security. The localhost server binds only to 127.0.0.1 and exposes an explicit public-asset list; it does not expose `private/`, credentials or the home directory. Keep its terminal open while using it. Press Ctrl+C to stop. A fixed local port gives a consistent browser-save origin; changing port/browser changes that origin.

`Prepare` installs nothing. It creates `private/pc-setup/setup-plan.json`, `SETUP-NEXT.md` and `dashboard-initial.json`. Import the last file into the dashboard to apply connection-based exclusions with all income unknown and all current-plan selections off. Tethered excludes Honeygain/EarnFM for this PC; other background candidates remain unresolved pending their own rules. Broadband remains conditional on provider/carrier permission. Repeated preparation preserves existing owner files. Choose a new output directory for a new plan.

## Inventory without excess data

Run the audit. It records Windows architecture, system RAM and GPU names/reported VRAM. `AdapterRAM` is a Windows-reported field and may be inaccurate on large GPUs; use `nvidia-smi` when available. Do not collect hostname, serial, IMEI, contact lists, credentials, public IP or payment details. Ask only for country, connection type/permissions, cap, additional cost, normal device use and payment availability if missing.

An 8 GB system-RAM PC does not meet current Salad container minimums; mark it excluded instead of buying RAM or enabling mining. Bandwidth candidates do not require a high-end GPU. UserTesting additionally requires supported display/upload/microphone; inventory alone does not prove all conditions.

Always confirm the current owner's connection before installing. Do not infer broadband from a Wi-Fi interface; it may connect to a phone hotspot. Honeygain prohibits mobile tethering; EarnFM excludes cellular-only sharing. Recheck each provider's current network rule individually. Separate owned phones can have shared carrier public IPs. This guide's phone-tethered example excludes those two PC routes; it is not a blanket prohibition on every provider.

## Candidate and download selection

- Start with one eligible background client on an already-running PC, using allowed broadband and a usable payment route.
- Honeygain / ProxyRack / PacketStream are first comparisons, with current India/country, network, minimum and redemption checks.
- Bitping is an optional passive-network job test with unknown demand, crypto payout caveats and no fixed income rate.
- ByteLixir / EarnFM / Repocket / TraffMonetizer remain conditional on connection and payout; all have separate accounts/thresholds. Do not blindly add their quoted earnings.
- UserTesting / uTest / Test IO / Clickworker / freelancing are active work. The agent can prepare the environment and truthful draft profile; the owner completes qualification and performs actual work. No task farming or invented human feedback.

Read `pc-work-playbooks.html` before active-work onboarding. uTest's published best practices prohibit AI-written issue reports, test cases and Tester Review feedback; the agent's role there is environment preparation and general education, not drafting those submissions. Other platforms have their own task/AI rules; follow them instead of assuming permission.

Additional conditional routes are documented in `more-pc-routes.html`: Userlytics, Respondent, OneForma, CrowdGen, Adobe Stock and original Gumroad products. These are human participation, project work or asset creation/sales, not more bandwidth installations. Owner qualification and rights/payment checks remain necessary. Agent preparation must not submit personal applications, studies or products without actual user authorization and review. A gift-card incentive is not cleared bank/PayPal cash.

```powershell
# Open one provider's official current setup page:
.\setup-pc.ps1 -Action OpenProvider -App honeygain

# Resolve a CURRENT Windows installer from the official page/dashboard first.
# This example opens an agent-selected URL variable; it is not an installer URL to guess.
$officialInstaller = 'PASTE_CURRENT_OFFICIAL_HTTPS_EXE_OR_MSI_URL'
.\setup-pc.ps1 -Action Download -App earnfm -Connection Broadband -InstallerUrl $officialInstaller
```

Some downloads are only visible after owner sign-in; pause that provider-specific step until the owner completes it while continuing other useful work. Do not collect a password or automate an interactive challenge. Allowlisted hosts are conservative and may become stale; reverify origin instead of accepting arbitrary URLs. The helper refuses redirects: inspect and validate the final official address before retrying. No binaries are distributed with the repository.

## Signature and installer execution

The download action saves SHA256, Authenticode status and signer subject in `private/pc-setup/`. A hash you just computed detects later change; it is not independent evidence of authenticity. Verify source and publisher from trustworthy provider evidence or a reproducibly checked official signed artifact. A valid signature from an unrelated publisher is insufficient. No publisher names are silently trusted by default.

```powershell
# Owner has authorized the selected installation; source/publisher now verified.
$publisher = 'INDEPENDENTLY_VERIFIED_FULL_CERTIFICATE_SUBJECT'
.\setup-pc.ps1 -Action Install -App earnfm -Connection Broadband `
  -InstallerUrl $officialInstaller -VerifiedPublisher $publisher
```

The helper downloads again, checks validity and exact publisher subject, optionally checks `-VerifiedSha256`, then launches the ordinary interactive EXE/MSI. It supplies no silent consent switches. UAC, license acceptance, provider permissions and sign-in remain owner-controlled. An installer exiting is not proof of installation: check the app/version using a targeted read-only query or visible UI. Do not disable antivirus, add exclusions, bypass signing failures, open inbound ports, install emulators or rotate geography/IPs for rewards.

## Startup and operational verification

1. Owner reads current network/data-consent terms and signs into their own account.
2. Check the client's own sharing setting and dashboard activity. Connected alone is not proof of paid traffic.
3. Record a timestamp, pooled opening balance and any old/bonus/referral credits separately.
4. For the first observation window, run one intended provider; leave startup and energy settings unchanged until needed and authorized.
5. After a useful pilot, prefer the app's startup/idle schedule controls. Do not create hidden persistence or globally prevent sleep on a laptop.
6. If pause/uninstall is needed, use the client's documented Stop/Pause control and normal Windows uninstall. Exiting a window may not stop a service. Verify the process/service actually stops before claiming sharing ended.

## Dashboard entry contract

Open `http://127.0.0.1:8769/dashboard.html`. Everything starts as Candidate, unknown income, zero actual receipts. Update status only with evidence:

- Downloaded: an actual verified artifact/receipt exists.
- Installed: targeted app verification succeeded.
- Needs sign-in: app installed but owner onboarding incomplete.
- Testing: owner has enabled a valid test, with a stated observation window.
- Paid: a payout has actually cleared, not merely been requested.
- Paused/Excluded: earning projection omitted, with reason in your private setup report.

Enter ONE pooled row/provider, covering all that user's relevant devices. Use new recurring USD credits during an observation window; exclude starting balance, signup/referral bonuses and active-task credits from a passive row. Convert source-native units using the actual provider conversion, document original units privately, and never assume credits equal dollars. Payout minimum and current unpaid balance are separate fields. No provider login/API access is implemented.

Observed mode extrapolates earned USD / days × 30. Scenario mode uses a manually entered monthly gross assumption. Neither predicts continuing demand. Summaries use only explicitly selected current-plan Testing/Paid rows; comparison windows are not additive. Scenarios are excluded from observed totals. Cleared INR cash minus actual costs is a separate reporting-month measure. Hypothetical costs and actual costs paid must not be interchanged. Deduct fees once; avoid counting fees again if the received amount is already net.

Optional active-work INR/hour and extra available billable hours/week calculate additional workload for the remaining observed target. Do not present the input as a platform wage. Allow unpaid screening/learning/acquisition time. Existing version 1 exports migrate without overwriting row values or selections; newly added candidates begin unknown and unselected. The hourly assumption is preserved in version 2 exports.

Use Export private JSON before reload, month switch or replacing data. A month switch asks confirmation and resets actual cash/costs while preserving observation and balance fields. Default state is memory-only. Save in browser is explicit, optional and scoped to browser/origin; GitHub Pages paths under the same owner share an origin. It is not a secret store. Import validates size, shape, numeric fields and provider IDs and rejects duplicates. Do not hand-edit exports to insert secrets. Unknown stays blank, actual zero is entered as zero.

## Measurement and target plan

Days 1–3: audit, provider eligibility, one install, owner onboarding, stable first observation. Days 4–7: daily pooled-credit reconciliation, device traffic log and real extra cost. Day 7: compare actual run rate with the target. Days 8–14: one alternative in a separate comparison window, then first eligible withdrawal. Days 15–21: verify repeatability and cost; no capacity purchases without a positive marginal result and cleared payout. Days 22–30: continue only the proven configuration, reconcile paid/unpaid and report next-month scenario.

At illustrative INR85/USD and USD0.10/paid GB, INR30k gross requires about117.65 paid GB/day total. The handbook's example costs/fees raise the net target requirement to about126GB/day. Capacity is not customer demand. Higher-rate classifications reduce required volume but do not prove sales. Use `internet-income-plan.html` for math and `dashboard.html` for observation-based figures.

If passive income falls short and the owner wants active work, prepare ONE testing/freelance route, not every platform. Honest profile, training/practice, invitations and actual human work remain required. No platform promises a job stream; payment delays may exceed the first month.

## Final report an agent must give

Record files created, candidates excluded and why, official downloads/signature evidence, actual installations verified, owner onboarding still needed, what is running, test start time, source of balances, observed versus hypothetical estimates, expenses, payout threshold/timing, cash cleared and unresolved constraints. Link the local dashboard and private export location. Say “ready for sign-in” or “ready for testing” when that is the true result; do not claim earnings activated merely because scripts ran.
