# Arctic Books — Audit Checklist (v4 → v5 split build)

Legend: ✅ checked, no change needed · 🔧 found and fixed · ⚠️ found, NOT changed (needs your decision) · ❌ could not verify here

## A. Loading / hanging (your main complaint)
| # | Check | Result |
|---|---|---|
| A1 | In-browser Babel compiling ~13k lines of JSX on every page load | 🔧 Root cause. JSX is now pre-compiled to plain JS; Babel (~3 MB) is no longer downloaded or run |
| A2 | One 930 KB inline script blocking parse | 🔧 Split into 13 ordered files (~710 KB total minified, cached by the browser between visits) |
| A2b | Firebase loader must be an INLINE module: external module files are blocked on file:// and caused an endless "Loading your data from cloud" in the first zip | 🔧 Fixed in v5.1 |
| A3 | Heavy libs (jsPDF, autotable, SheetJS, ExcelJS, qrcode) loaded render-blocking in `<head>` | 🔧 Now loaded after first paint via `js/lib-loader.js` |
| A4 | Ledger rebuilt from all invoices/purchases/bank/stock on every call (`getAllLedgerLines` → trial balance, GL, P&L, balance sheet, pulse) | 🔧 Memoized on a data-version counter + today's date; invalidated on every store write/load |
| A5 | Global MutationObserver (table alignment) firing on whole document every 300 ms | 🔧 Now observes only `#root`, 700 ms debounce, runs in idle time |
| A6 | Cash-pulse poll every 90 s (`computePulse`) | ✅ Kept; now cheaper because of A4 |
| A7 | Offline retry every 12 s in `bootLoad` | ✅ Kept intentionally (auto-recovery); only runs while disconnected |
| A8 | CSS `div:has(>table)` rule | ⚠️ Left as is (layout-affecting); can be slow on very large pages |
| A9 | Google Fonts | ✅ Already `display=swap` |

## B. Bugs
| # | Check | Result |
|---|---|---|
| B1 | `<Ic …/>` written inside template strings (rendered as literal text) in `autoSavePDF` toast and Product Master "All Products" tab | 🔧 Fixed (plain text) |
| B2 | `Ic n="database"` not defined → icon rendered nothing in Export tab | 🔧 Added icon |
| B3 | `runRecurringJournals(user)` called in `bootLoad` before `user` exists | 🔧 Now passes the signed-in Firebase email (was silently `'auto'`) |
| B4 | `genInvNo(type, date)` called with 2 args but accepts 1 | ⚠️ Harmless; the invoice date is ignored for numbering. Not changed (could alter numbering) |
| B5 | Stale state in BankReconPage | ❌ Not confirmed; needs real data testing |

## C. Security
| # | Check | Result |
|---|---|---|
| C1 | Hard-coded default password `Business@2026` for 2 seeded super-admins | ⚠️ Change those passwords after first login / remove from `seedUsers` |
| C2 | Super-admin emails hard-coded (`SUPER_ADMINS`) and role gating is client-side only | ⚠️ Enforce with Firebase Realtime DB security rules; client checks can be bypassed |
| C3 | Firebase web config in source | ✅ Normal for web apps, but only safe with strict DB rules (verify in Firebase console) |
| C4 | Legacy plaintext password migration (`LEGACY_MIGRATION=true`) | ⚠️ Turn off once all users have migrated |
| C5 | 2FA (`REQUIRE_2FA=false`) | ⚠️ Optional; enabling recommended for admins |
| C6 | `innerHTML` use | ✅ 1 occurrence in source |
| C7 | Writes blocked until cloud load succeeds (prevents data wipe) | ✅ Logic reviewed, intact |

## D. Data safety / accounting logic
| # | Check | Result |
|---|---|---|
| D1 | Single store choke point `S.set`, localStorage as backup | ✅ Unchanged |
| D2 | Ledger memo cannot go stale | ✅ Version bumped in `S.set` and every `loadCache` write; direct writes to users/audit keys don't affect the ledger |
| D3 | Journal balancing (debit = credit ±0.02) | ✅ Present in `add()` |
| D4 | Accounting formulas (GST, FIFO, depreciation, FX) | ❌ Code read-through only; no numeric test against your data |

## E. Structure / packaging
| # | Check | Result |
|---|---|---|
| E1 | Split on top-level statement boundaries (parsed with an AST, no gaps between files) | ✅ |
| E2 | All 13 files pass syntax check | ✅ |
| E3 | All 13 files run in order in a stubbed environment; app `render` call reached | ✅ |
| E4 | Real browser test with Firebase, React CDN, login and exports | ❌ Not possible here (network blocked). Please test login, an invoice, a PDF and an Excel export |

## File order (must stay in this order)
01-config-storage → 02-export-engine → 03-utils-dates-series → 04-icons-pdf-excel → 05-modals-tabs → 06-admin-login-invoice-po → 07-inventory-dashboard-aging → 08-bank-sales → 09-accounting-engine → 10-reports-ui-coa-gl-tb → 11-quotes-dc-recurring → 12-assets-fx-budget-advance → 13-topbar-app-boot

Files share one global scope (like the original), so they must be loaded in that order. `src/` holds the full editable JSX source and readable versions of each part. To edit: change `src/arctic-books.source.jsx`, then recompile with esbuild.

---
## v5.2 changes (header, cash flow drill-down, role access)
| # | Check | Result |
|---|---|---|
| F1 | Cash & bank balance shown in the header (and its "cash pulse" dropdown with receivables/payables) | 🔧 Removed. Balances now appear only inside pages that are role-gated |
| F2 | Header search box squeezed/clipped ("S" + Ctrl K overlapping) | 🔧 Minimum width, no shrinking of icon/kbd, ellipsis, shortcut hint hidden on narrow screens, shorter placeholder |
| F3 | Cash Flow Statement: click any line or amount to see what is inside | 🔧 Added. Line → ledgers → transactions (same ledger view as Trial Balance). Section totals, Net increase, opening and closing cash are clickable too; breadcrumb to go back |
| F4 | Drill-down amounts add up to the line they came from | ✅ Tested with synthetic entries (ledger items sum to each line; statement ties to cash, difference 0) |
## Role-access audit (roles: sales, accountant, user, admin, superadmin)
| # | Check | Result |
|---|---|---|
| R1 | Sidebar showed **Purchase Orders** and **Purchases** to every role, although the Sales role is not allowed them | 🔧 Now hidden unless the role is allowed |
| R2 | Page bodies for Invoice History, Purchase Orders, Purchases, Customers, Dashboard, Company, HSN were not role-checked, so Back button / saved state / links could open them | 🔧 Central guard: a role can only render pages in its list, otherwise Dashboard. Admin page only for admin/superadmin |
| R3 | "Company" and "HSN/SAC" use the Company permission | ✅ Consistent now (HSN follows Company) |
| R4 | Alerts bell could link a Sales user to Ageing / Bank Recon pages | 🔧 Alerts are filtered to pages the role can open |
| R5 | Command palette and "+ New" menu | ✅ Already checked per role |
| R6 | Sales role: Dashboard, New Invoice, Invoice History, Customers, Sales, Quotations, Delivery Challans, Recurring Invoices, Payment Reminders | ✅ as defined in `ROLE_PAGES` |
| R7 | Accountant role: all of the above plus Purchase Orders, Purchases, Inventory, Ageing, Bank Recon, Terms, and all accounting reports. No Company / HSN / Admin | ✅ as defined |
| R8 | user / admin / superadmin: full access; Admin panel only admin + superadmin | ✅ |
| R9 | Dashboard content (totals, charts) is the same for every role that can open it | ⚠️ Not changed. If Sales should not see profit or purchase totals, tell me which cards to hide |
| R10 | All of the above is enforced in the browser only | ⚠️ Real enforcement needs Firebase security rules (see C2) |
