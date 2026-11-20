const BS_LIAB_GROUPS = ["Non-Current Liabilities", "Current Liabilities"];
const ReportsPage = ({ inline = true, onClose, currentUser }) => {
  var _a;
  const [tab, setTab] = useState("pl");
  const [format, setFormat] = useState("schedule3");
  const [basis, setBasis] = useState("accrual");
  const [selFY, setSelFY] = useState(getFY());
  const fyStart = fyStartOf(selFY);
  const [fromDate, setFromDate] = useState(fyStart);
  const [toDate, setToDate] = useState(today());
  const [asOf, setAsOf] = useState(today());
  const pickFY = (y) => {
    y = parseInt(y);
    setSelFY(y);
    const end = fyEndOf(y), t = today();
    const e = end < t ? end : t;
    setFromDate(fyStartOf(y));
    setToDate(e);
    setAsOf(e);
  };
  const fySel = /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Financial Year"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: selFY, onChange: (ev) => pickFY(ev.target.value) }, [0, 1, 2, 3, 4, 5].map((k) => getFY() - k).map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y }, fyLabelOf(y), " (1 Apr ", y, " - 31 Mar ", y + 1, ")"))));
  const co = S.get(SK.CO, {});
  const [drill, setDrill] = useState(null);
  const effBasis = format === "schedule3" ? "accrual" : basis;
  const pl = useMemo(() => effBasis === "cash" ? getPLCash(fromDate, toDate) : getPLAccrual(fromDate, toDate), [fromDate, toDate, effBasis]);
  const bs = useMemo(() => getBalanceSheet(asOf), [asOf]);
  const tb = useMemo(() => getTrialBalance(asOf), [asOf]);
  const tbDebit = tb.filter((r) => r.balance >= 0).reduce((s, r) => s + r.balance, 0);
  const tbCredit = tb.filter((r) => r.balance < 0).reduce((s, r) => s - r.balance, 0);
  const allAccOrder = getAllAccounts();
  const prevFrom = shiftYear(fromDate, -1), prevTo = shiftYear(toDate, -1);
  const prevAsOf = prevFYEnd(asOf);
  const plPrev = useMemo(() => effBasis === "cash" ? getPLCash(prevFrom, prevTo) : getPLAccrual(prevFrom, prevTo), [prevFrom, prevTo, effBasis]);
  const bsPrev = useMemo(() => getBalanceSheet(prevAsOf), [prevAsOf]);
  const tbPrev = useMemo(() => getTrialBalance(prevAsOf), [prevAsOf]);
  const tbDebitPrev = tbPrev.filter((r) => r.balance >= 0).reduce((s, r) => s + r.balance, 0);
  const tbCreditPrev = tbPrev.filter((r) => r.balance < 0).reduce((s, r) => s - r.balance, 0);
  const tbUnionAccounts = useMemo(() => {
    const keys = [];
    tb.forEach((r) => {
      if (!keys.includes(r.account)) keys.push(r.account);
    });
    tbPrev.forEach((r) => {
      if (!keys.includes(r.account)) keys.push(r.account);
    });
    return keys.sort((a, b) => allAccOrder.findIndex((x) => x.key === a) - allAccOrder.findIndex((x) => x.key === b));
  }, [tb, tbPrev]);
  const tbBalOf = (list, key) => {
    var _a2;
    return ((_a2 = list.find((x) => x.account === key)) == null ? void 0 : _a2.balance) || 0;
  };
  const bsPrevAll = [...bsPrev.assets, ...bsPrev.liabilities, ...bsPrev.equity];
  const prevAmtByKey = (key) => {
    var _a2;
    return ((_a2 = bsPrevAll.find((a) => a.key === key)) == null ? void 0 : _a2.amount) || 0;
  };
  const expByKey = (key) => {
    var _a2;
    return ((_a2 = (pl.rows || []).find((r) => r.account === key)) == null ? void 0 : _a2.amount) || 0;
  };
  const otherIncome = (pl.rows || []).filter((r) => r.type === "income" && r.account !== "SALES").reduce((s, r) => s + r.amount, 0);
  const salesRevenue = expByKey("SALES");
  const otherIncomePrev = (plPrev.rows || []).filter((r) => r.type === "income" && r.account !== "SALES").reduce((s, r) => s + r.amount, 0);
  const salesRevenuePrev = ((_a = (plPrev.rows || []).find((r) => r.account === "SALES")) == null ? void 0 : _a.amount) || 0;
  const expenseCaptions = useMemo(() => groupByCaption((pl.rows || []).filter((r) => r.type === "expense"), EXP_CAPTION_ORDER_LOCAL), [pl]);
  const incomeCaptions = useMemo(() => groupByCaption((pl.rows || []).filter((r) => r.type === "income"), ["Revenue from Operations", "Other Income"]), [pl]);
  const expenseCaptionsPrev = useMemo(() => groupByCaption((plPrev.rows || []).filter((r) => r.type === "expense"), EXP_CAPTION_ORDER_LOCAL), [plPrev]);
  const incomeCaptionsPrev = useMemo(() => groupByCaption((plPrev.rows || []).filter((r) => r.type === "income"), ["Revenue from Operations", "Other Income"]), [plPrev]);
  const expenseCaptionsCmp = useMemo(() => mergeCaptionAmounts(expenseCaptions, expenseCaptionsPrev), [expenseCaptions, expenseCaptionsPrev]);
  const incomeCaptionsCmp = useMemo(() => mergeCaptionAmounts(incomeCaptions, incomeCaptionsPrev), [incomeCaptions, incomeCaptionsPrev]);
  const plNormalIncomeCmp = useMemo(() => {
    const cur = (pl.rows || []).filter((r) => r.type === "income" && r.account !== "SALES"), prev = (plPrev.rows || []).filter((r) => r.type === "income" && r.account !== "SALES");
    const accs = [.../* @__PURE__ */ new Set([...cur.map((r) => r.account), ...prev.map((r) => r.account)])];
    return accs.map((acc) => {
      var _a2, _b, _c, _d;
      return { account: acc, name: ((_a2 = cur.find((r) => r.account === acc)) == null ? void 0 : _a2.name) || ((_b = prev.find((r) => r.account === acc)) == null ? void 0 : _b.name), amount: ((_c = cur.find((r) => r.account === acc)) == null ? void 0 : _c.amount) || 0, prevAmount: ((_d = prev.find((r) => r.account === acc)) == null ? void 0 : _d.amount) || 0 };
    });
  }, [pl, plPrev]);
  const plNormalExpenseCmp = useMemo(() => {
    const cur = (pl.rows || []).filter((r) => r.type === "expense"), prev = (plPrev.rows || []).filter((r) => r.type === "expense");
    const accs = [.../* @__PURE__ */ new Set([...cur.map((r) => r.account), ...prev.map((r) => r.account)])];
    return accs.map((acc) => {
      var _a2, _b, _c, _d;
      return { account: acc, name: ((_a2 = cur.find((r) => r.account === acc)) == null ? void 0 : _a2.name) || ((_b = prev.find((r) => r.account === acc)) == null ? void 0 : _b.name), amount: ((_c = cur.find((r) => r.account === acc)) == null ? void 0 : _c.amount) || 0, prevAmount: ((_d = prev.find((r) => r.account === acc)) == null ? void 0 : _d.amount) || 0 };
    }).sort((a, b) => b.amount - a.amount);
  }, [pl, plPrev]);
  const closeDrill = () => setDrill(null);
  const openCaptionDrill = (side, caption, accounts) => setDrill({ kind: "caption", side, caption, accounts });
  const openLedgerDrill = (account) => setDrill({ kind: "ledger", account });
  const doExportPL = (f) => {
    const headers = ["Head", `Current (${fmtDate(fromDate)} to ${fmtDate(toDate)})`, `Previous Year (${fmtDate(prevFrom)} to ${fmtDate(prevTo)})`];
    const rows = [];
    if (effBasis === "cash") {
      rows.push(["Total Receipts", fmtN(pl.income), fmtN(plPrev.income)], ["Total Payments", fmtN(pl.expense), fmtN(plPrev.expense)], ["Net Cash Surplus/(Deficit)", fmtN(pl.net), fmtN(plPrev.net)]);
    } else if (format === "schedule3") {
      rows.push(
        ["I. Revenue from Operations", fmtN(salesRevenue), fmtN(salesRevenuePrev)],
        ["II. Other Income", fmtN(otherIncome), fmtN(otherIncomePrev)],
        ["III. Total Income", fmtN(pl.income), fmtN(plPrev.income)],
        ["IV. Expenses", "", ""],
        ...expenseCaptionsCmp.map((c) => ["   " + c.caption, fmtN(c.amount), fmtN(c.prevAmount)]),
        ["Total Expenses", fmtN(pl.expense), fmtN(plPrev.expense)],
        ["V. Profit Before Tax", fmtN(pl.net), fmtN(plPrev.net)],
        ["VI. Profit for the Period", fmtN(pl.net), fmtN(plPrev.net)]
      );
    } else {
      rows.push(["Sales", fmtN(salesRevenue), fmtN(salesRevenuePrev)]);
      if (otherIncome > 5e-3 || otherIncomePrev > 5e-3) rows.push(["Other Income", fmtN(otherIncome), fmtN(otherIncomePrev)]);
      const expNames = [.../* @__PURE__ */ new Set([...(pl.rows || []).filter((r) => r.type === "expense").map((r) => r.name), ...(plPrev.rows || []).filter((r) => r.type === "expense").map((r) => r.name)])];
      expNames.forEach((name) => {
        var _a2, _b;
        return rows.push([name, fmtN(((_a2 = (pl.rows || []).find((r) => r.name === name)) == null ? void 0 : _a2.amount) || 0), fmtN(((_b = (plPrev.rows || []).find((r) => r.name === name)) == null ? void 0 : _b.amount) || 0)]);
      });
      rows.push(["Net Profit/(Loss)", fmtN(pl.net), fmtN(plPrev.net)]);
    }
    exportTableAs(f, `PL_${fromDate}_to_${toDate}`, `Statement of Profit & Loss (${effBasis === "cash" ? "Cash" : format === "schedule3" ? "Companies Act" : "Normal"} format) \u2014 for the period ${fmtDateLong(fromDate)} to ${fmtDateLong(toDate)}${co.name ? " \u2014 " + co.name : ""}`, headers, rows);
  };
  const doExportBS = (f) => {
    const headers = ["Head", `As at ${fmtDate(asOf)}`, `As at ${fmtDate(prevAsOf)} (Previous Year)`];
    const rows = [
      ["EQUITY AND LIABILITIES", "", ""],
      ...bs.equity.map((e) => ["  " + e.name, fmtN(e.amount), fmtN(prevAmtByKey(e.key))]),
      ...bs.liabilities.map((l) => ["  " + l.name, fmtN(l.amount), fmtN(prevAmtByKey(l.key))]),
      ["TOTAL", fmtN(bs.totalLiab + bs.totalEquity), fmtN(bsPrev.totalLiab + bsPrev.totalEquity)],
      ["ASSETS", "", ""],
      ...bs.assets.map((a) => ["  " + a.name, fmtN(a.amount), fmtN(prevAmtByKey(a.key))]),
      ["TOTAL", fmtN(bs.totalAssets), fmtN(bsPrev.totalAssets)]
    ];
    exportTableAs(f, `BalanceSheet_${asOf}`, `Balance Sheet as at ${fmtDateLong(asOf)} (${format === "schedule3" ? "Companies Act" : "Normal"} format)${co.name ? " \u2014 " + co.name : ""}`, headers, rows);
  };
  const doExportTB = (f) => {
    const headers = ["Account", `Debit (as at ${fmtDate(asOf)})`, `Credit (as at ${fmtDate(asOf)})`, `Debit (as at ${fmtDate(prevAsOf)})`, `Credit (as at ${fmtDate(prevAsOf)})`];
    const rows = tbUnionAccounts.map((key) => {
      const bal = tbBalOf(tb, key), balP = tbBalOf(tbPrev, key);
      return [coaByKey(key).name, bal >= 0 ? fmtN(bal) : "", bal < 0 ? fmtN(-bal) : "", balP >= 0 ? fmtN(balP) : "", balP < 0 ? fmtN(-balP) : ""];
    });
    rows.push(["Total", fmtN(tbDebit), fmtN(tbCredit), fmtN(tbDebitPrev), fmtN(tbCreditPrev)]);
    exportTableAs(f, `TrialBalance_${asOf}`, `Trial Balance as at ${fmtDateLong(asOf)}${co.name ? " \u2014 " + co.name : ""}`, headers, rows);
  };
  const clickable = { cursor: "pointer", color: "var(--primary2)", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" };
  if ((drill == null ? void 0 : drill.kind) === "ledger") {
    return /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card" : "overlay" }, /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card-inner" : "modal" }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(Breadcrumb, { items: [
      { label: "Financial Statements", onClick: closeDrill },
      { label: coaByKey(drill.account).name }
    ] }), /* @__PURE__ */ React.createElement(LedgerTable, { account: drill.account, fromDate: tab === "pl" ? fromDate : OPENING_DATE, toDate: tab === "pl" ? toDate : asOf }))));
  }
  if ((drill == null ? void 0 : drill.kind) === "caption") {
    const dExport = (f) => {
      const headers = ["Ledger", "Amount"];
      const rows = drill.accounts.map((a) => [a.name || coaByKey(a.key || a.account).name, fmtN(a.amount)]);
      exportTableAs(f, `${drill.caption.replace(/\s+/g, "_")}`, `${drill.caption} \u2014 constituent ledgers`, headers, rows);
    };
    return /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card" : "overlay" }, /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card-inner" : "modal" }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(Breadcrumb, { items: [{ label: "Financial Statements", onClick: closeDrill }, { label: drill.caption }] }), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement(ExportBar, { onExport: dExport, label: "Export" })), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Ledger Account"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Amount"))), /* @__PURE__ */ React.createElement("tbody", null, drill.accounts.map((a, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", { style: clickable, onClick: () => openLedgerDrill(a.key || a.account) }, a.name || coaByKey(a.key || a.account).name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(a.amount)))), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "Total"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(drill.accounts.reduce((s, a) => s + a.amount, 0))))))))));
  }
  return /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card" : "overlay" }, /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card-inner" : "modal" }, !inline && /* @__PURE__ */ React.createElement("div", { className: "modal-hdr" }, /* @__PURE__ */ React.createElement("span", { className: "modal-title" }, /* @__PURE__ */ React.createElement(Ic, { n: "chart", s: 18 }), " Financial Statements"), /* @__PURE__ */ React.createElement("button", { className: "close-btn", onClick: onClose }, /* @__PURE__ */ React.createElement(Ic, { n: "x" }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { className: "alert", style: { background: "rgba(79,111,232,0.06)", border: "1px solid rgba(79,111,232,0.2)", marginBottom: 16, borderRadius: 10, fontSize: 12 } }, "Generated from a full double-entry ledger (see Chart of Accounts, Journal Vouchers, General Ledger & Trial Balance) \u2014 posted automatically from your Sales, Purchases and Bank Reconciliation. Click any caption or ledger below to drill into its transactions. Not a substitute for statements reviewed and signed off by your CA."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, [["pl", "Profit & Loss"], ["bs", "Balance Sheet"], ["tb", "Trial Balance"]].map(([k, l]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: k,
      onClick: () => setTab(k),
      style: {
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: tab === k ? 700 : 500,
        cursor: "pointer",
        border: `2px solid ${tab === k ? "var(--primary)" : "var(--border2)"}`,
        background: tab === k ? "var(--primary-bg)" : "transparent",
        color: tab === k ? "var(--primary2)" : "var(--text2)"
      }
    },
    l
  ))), (tab === "pl" || tab === "bs") && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, [["schedule3", "Companies Act Format"], ["normal", "Normal Format"]].map(([k, l]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: k,
      onClick: () => setFormat(k),
      style: {
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 11.5,
        fontWeight: format === k ? 700 : 500,
        cursor: "pointer",
        border: `2px solid ${format === k ? "var(--green)" : "var(--border2)"}`,
        background: format === k ? "rgba(46,160,67,0.12)" : "transparent",
        color: format === k ? "var(--green)" : "var(--text2)"
      }
    },
    l
  ))), tab === "pl" && format === "normal" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, [["accrual", "Accrual Basis"], ["cash", "Cash Basis"]].map(([k, l]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: k,
      onClick: () => setBasis(k),
      style: {
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 11.5,
        fontWeight: basis === k ? 700 : 500,
        cursor: "pointer",
        border: `2px solid ${basis === k ? "var(--gold)" : "var(--border2)"}`,
        background: basis === k ? "rgba(241,73,92,0.12)" : "transparent",
        color: basis === k ? "var(--gold)" : "var(--text2)"
      }
    },
    l
  )))), tab === "pl" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 16, alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" } }, fySel, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "From"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: fromDate, onChange: (e) => setFromDate(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "To"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: toDate, onChange: (e) => setToDate(e.target.value) }))), /* @__PURE__ */ React.createElement(ExportBar, { onExport: doExportPL, label: "Export P&L" })), /* @__PURE__ */ React.createElement("div", { className: "g3", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "stat-card" }, /* @__PURE__ */ React.createElement("div", { className: "stat-val", style: { fontSize: 16, color: "var(--green)" } }, fmt(pl.income)), /* @__PURE__ */ React.createElement("div", { className: "stat-lbl" }, "Total Income (", effBasis === "cash" ? "Cash" : "Accrual", ")")), /* @__PURE__ */ React.createElement("div", { className: "stat-card" }, /* @__PURE__ */ React.createElement("div", { className: "stat-val", style: { fontSize: 16, color: "var(--red)" } }, fmt(pl.expense)), /* @__PURE__ */ React.createElement("div", { className: "stat-lbl" }, "Total Expenses")), /* @__PURE__ */ React.createElement("div", { className: "stat-card", style: { borderLeft: `3px solid ${pl.net >= 0 ? "var(--green)" : "var(--red)"}` } }, /* @__PURE__ */ React.createElement("div", { className: "stat-val", style: { fontSize: 16, color: pl.net >= 0 ? "var(--green)" : "var(--red)" } }, fmt(pl.net)), /* @__PURE__ */ React.createElement("div", { className: "stat-lbl" }, effBasis === "cash" ? "Net Cash Surplus" : "Profit for the Period"))), effBasis === "cash" ? /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { colSpan: 3 }, "Receipts & Payments Statement \u2014 for the period ", fmtDateLong(fromDate), " to ", fmtDateLong(toDate), co.name ? " \u2014 " + co.name : "")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Head"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Current (", fmtDate(fromDate), "\u2013", fmtDate(toDate), ")"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "Previous Year (", fmtDate(prevFrom), "\u2013", fmtDate(prevTo), ")"))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Total Receipts (Bank credits in period)"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 600 } }, fmt(pl.income)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(plPrev.income))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Total Payments (Bank debits in period)"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(pl.expense)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(plPrev.expense))), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "Net Cash Surplus / (Deficit)"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: pl.net >= 0 ? "var(--green)" : "var(--red)" } }, fmt(pl.net)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(plPrev.net))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text3)", marginTop: 8 } }, "Receipts & Payments basis \u2014 counts only actual money that moved through the Bank in this period, ignoring unpaid invoices/bills. Companies Act statements must use the Accrual basis. (No ledger drill-down here \u2014 the underlying view is Bank Reconciliation.) The Previous Year column covers the corresponding period one year earlier (", fmtDate(prevFrom), " to ", fmtDate(prevTo), ").")) : format === "schedule3" ? /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { colSpan: 3 }, "Statement of Profit & Loss \u2014 for the period ended ", fmtDateLong(toDate), co.name ? " \u2014 " + co.name : "")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Particulars"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Current Year (", fmtDate(fromDate), " to ", fmtDate(toDate), ")"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "Previous Year (", fmtDate(prevFrom), " to ", fmtDate(prevTo), ")"))), /* @__PURE__ */ React.createElement("tbody", null, incomeCaptionsCmp.filter((c) => c.caption === "Revenue from Operations").map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.caption }, /* @__PURE__ */ React.createElement("td", null, "I. ", c.caption), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openCaptionDrill("income", c.caption, c.accounts) }, fmt(c.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(c.prevAmount)))), incomeCaptionsCmp.filter((c) => c.caption === "Other Income").map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.caption }, /* @__PURE__ */ React.createElement("td", null, "II. ", c.caption), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openCaptionDrill("income", c.caption, c.accounts) }, fmt(c.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(c.prevAmount)))), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700 } }, /* @__PURE__ */ React.createElement("td", null, "III. Total Income (I + II)"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(pl.income)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(plPrev.income))), /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)" } }, /* @__PURE__ */ React.createElement("td", { colSpan: 3, style: { fontWeight: 700 } }, "IV. Expenses")), expenseCaptionsCmp.map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.caption }, /* @__PURE__ */ React.createElement("td", { style: { paddingLeft: 20, ...clickable }, onClick: () => openCaptionDrill("expense", c.caption, c.accounts) }, c.caption), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openCaptionDrill("expense", c.caption, c.accounts) }, fmt(c.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(c.prevAmount)))), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "Total Expenses"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(pl.expense)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(plPrev.expense))), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "V. Profit Before Tax (III \u2212 IV)"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: pl.net >= 0 ? "var(--green)" : "var(--red)" } }, fmt(pl.net)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(plPrev.net))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: { paddingLeft: 20, color: "var(--text3)" } }, "Tax Expense (to be computed by your CA)"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, "\u2014")), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "VI. Profit for the Period"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: pl.net >= 0 ? "var(--green)" : "var(--red)" } }, fmt(pl.net)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(plPrev.net))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text3)", marginTop: 10, whiteSpace: "pre-line" } }, /* @__PURE__ */ React.createElement("b", null, "Notes \u2014 Significant Accounting Policies:"), "\n", getPolicies())) : /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { colSpan: 3 }, "Profit & Loss Statement \u2014 for the period ", fmtDateLong(fromDate), " to ", fmtDateLong(toDate), co.name ? " \u2014 " + co.name : "")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Head"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Current (", fmtDate(fromDate), "\u2013", fmtDate(toDate), ")"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "Previous Year (", fmtDate(prevFrom), "\u2013", fmtDate(prevTo), ")"))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)" } }, /* @__PURE__ */ React.createElement("td", { colSpan: 3, style: { fontWeight: 700 } }, "Income")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: clickable, onClick: () => openLedgerDrill("SALES") }, "Sales"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 600, ...clickable }, onClick: () => openLedgerDrill("SALES") }, fmt(salesRevenue)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(salesRevenuePrev))), plNormalIncomeCmp.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.account }, /* @__PURE__ */ React.createElement("td", { style: clickable, onClick: () => openLedgerDrill(r.account) }, r.name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openLedgerDrill(r.account) }, fmt(r.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(r.prevAmount)))), /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)" } }, /* @__PURE__ */ React.createElement("td", { colSpan: 3, style: { fontWeight: 700 } }, "Expenses")), plNormalExpenseCmp.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 3, style: { color: "var(--text3)", textAlign: "center" } }, "No expenses in either period")) : plNormalExpenseCmp.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.account }, /* @__PURE__ */ React.createElement("td", { style: clickable, onClick: () => openLedgerDrill(r.account) }, r.name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openLedgerDrill(r.account) }, fmt(r.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(r.prevAmount)))), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "Net Profit / (Loss)"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: pl.net >= 0 ? "var(--green)" : "var(--red)" } }, fmt(pl.net)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(plPrev.net))))))), tab === "bs" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 16, alignItems: "flex-end" } }, fySel, /* @__PURE__ */ React.createElement("div", { className: "field", style: { maxWidth: 220 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "As of"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: asOf, onChange: (e) => setAsOf(e.target.value) })), /* @__PURE__ */ React.createElement(ExportBar, { onExport: doExportBS, label: "Export Balance Sheet" })), format === "schedule3" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "dt-wrap", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { colSpan: 3 }, "Balance Sheet as at ", fmtDateLong(asOf), " \u2014 ", co.name || "Company")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Particulars"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "As at ", fmtDate(asOf)), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "As at ", fmtDate(prevAsOf), " (Previous Year)"))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)" } }, /* @__PURE__ */ React.createElement("td", { colSpan: 3, style: { fontWeight: 700 } }, "I. EQUITY AND LIABILITIES")), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 600 } }, /* @__PURE__ */ React.createElement("td", null, "1. Shareholders' Funds"), /* @__PURE__ */ React.createElement("td", null), /* @__PURE__ */ React.createElement("td", null)), mergeCaptionAmounts(groupByCaption(bs.equity, ["Equity"]), groupByCaption(bsPrev.equity, ["Equity"])).map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.caption }, /* @__PURE__ */ React.createElement("td", { style: { paddingLeft: 20, ...clickable }, onClick: () => openCaptionDrill("equity", c.caption, c.accounts) }, c.caption), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openCaptionDrill("equity", c.caption, c.accounts) }, fmt(c.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(c.prevAmount)))), BS_LIAB_GROUPS.map((g) => {
    const rows = bs.liabilities.filter((l) => l.group === g), prevRows = bsPrev.liabilities.filter((l) => l.group === g);
    if (!rows.length && !prevRows.length) return null;
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: g }, /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 600 } }, /* @__PURE__ */ React.createElement("td", null, g === "Non-Current Liabilities" ? "2. Non-Current Liabilities" : "3. Current Liabilities"), /* @__PURE__ */ React.createElement("td", null), /* @__PURE__ */ React.createElement("td", null)), mergeCaptionAmounts(groupByCaption(rows), groupByCaption(prevRows)).map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.caption }, /* @__PURE__ */ React.createElement("td", { style: { paddingLeft: 20, ...clickable }, onClick: () => openCaptionDrill("liability", c.caption, c.accounts) }, c.caption), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openCaptionDrill("liability", c.caption, c.accounts) }, fmt(c.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(c.prevAmount)))));
  }), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "TOTAL"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(bs.totalLiab + bs.totalEquity)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(bsPrev.totalLiab + bsPrev.totalEquity)))))), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { colSpan: 3 }, "II. ASSETS")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Particulars"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "As at ", fmtDate(asOf)), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "As at ", fmtDate(prevAsOf), " (Previous Year)"))), /* @__PURE__ */ React.createElement("tbody", null, BS_ASSET_GROUPS.map((g) => {
    const rows = bs.assets.filter((a) => a.group === g), prevRows = bsPrev.assets.filter((a) => a.group === g);
    if (!rows.length && !prevRows.length) return null;
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: g }, /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 600 } }, /* @__PURE__ */ React.createElement("td", null, g === "Non-Current Assets" ? "1. Non-Current Assets" : "2. Current Assets"), /* @__PURE__ */ React.createElement("td", null), /* @__PURE__ */ React.createElement("td", null)), mergeCaptionAmounts(groupByCaption(rows), groupByCaption(prevRows)).map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.caption }, /* @__PURE__ */ React.createElement("td", { style: { paddingLeft: 20, ...clickable }, onClick: () => openCaptionDrill("asset", c.caption, c.accounts) }, c.caption), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openCaptionDrill("asset", c.caption, c.accounts) }, fmt(c.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(c.prevAmount)))));
  }), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "TOTAL"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(bs.totalAssets)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(bsPrev.totalAssets)))))), !bs.tallies && /* @__PURE__ */ React.createElement("div", { className: "alert", style: { marginTop: 12, color: "var(--red)" } }, "Balance Sheet does not tie out exactly \u2014 check the Trial Balance / recent Journal Vouchers."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text3)", marginTop: 10, whiteSpace: "pre-line" } }, /* @__PURE__ */ React.createElement("b", null, "Notes \u2014 Significant Accounting Policies:"), "\n", getPolicies())) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, marginBottom: 10 } }, "Balance Sheet as at ", fmtDateLong(asOf), co.name ? " \u2014 " + co.name : "", " ", /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 400, color: "var(--text3)", fontSize: 11.5 } }, "(Normal format, comparing against ", fmtDate(prevAsOf), ")")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Assets"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "As at ", fmtDate(asOf)), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "As at ", fmtDate(prevAsOf)))), /* @__PURE__ */ React.createElement("tbody", null, bs.assets.map((a) => /* @__PURE__ */ React.createElement("tr", { key: a.key }, /* @__PURE__ */ React.createElement("td", { style: clickable, onClick: () => openLedgerDrill(a.key) }, a.name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openLedgerDrill(a.key) }, fmt(a.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(prevAmtByKey(a.key))))), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "Total Assets"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(bs.totalAssets)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(bsPrev.totalAssets)))))), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Liabilities & Equity"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "As at ", fmtDate(asOf)), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "As at ", fmtDate(prevAsOf)))), /* @__PURE__ */ React.createElement("tbody", null, [...bs.liabilities, ...bs.equity].map((a) => /* @__PURE__ */ React.createElement("tr", { key: a.key }, /* @__PURE__ */ React.createElement("td", { style: clickable, onClick: () => openLedgerDrill(a.key) }, a.name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", ...clickable }, onClick: () => openLedgerDrill(a.key) }, fmt(a.amount)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(prevAmtByKey(a.key))))), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "Total Liabilities & Equity"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(bs.totalLiab + bs.totalEquity)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(bsPrev.totalLiab + bsPrev.totalEquity))))))))), tab === "tb" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 16, alignItems: "flex-end" } }, fySel, /* @__PURE__ */ React.createElement("div", { className: "field", style: { maxWidth: 220 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "As of"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: asOf, onChange: (e) => setAsOf(e.target.value) })), /* @__PURE__ */ React.createElement(ExportBar, { onExport: doExportTB, label: "Export Trial Balance" })), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { colSpan: 5 }, "Trial Balance as at ", fmtDateLong(asOf), co.name ? " \u2014 " + co.name : "")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { rowSpan: 2, style: { verticalAlign: "bottom" } }, "Account"), /* @__PURE__ */ React.createElement("th", { colSpan: 2, style: { textAlign: "center" } }, "As at ", fmtDate(asOf)), /* @__PURE__ */ React.createElement("th", { colSpan: 2, style: { textAlign: "center", color: "var(--text3)" } }, "As at ", fmtDate(prevAsOf), " (Previous Year)")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Debit"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Credit"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "Debit"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", color: "var(--text3)" } }, "Credit"))), /* @__PURE__ */ React.createElement("tbody", null, tbUnionAccounts.map((key) => {
    const bal = tbBalOf(tb, key), balP = tbBalOf(tbPrev, key);
    return /* @__PURE__ */ React.createElement("tr", { key }, /* @__PURE__ */ React.createElement("td", { style: clickable, onClick: () => openLedgerDrill(key) }, coaByKey(key).name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, bal >= 0 ? fmtN(bal) : ""), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, bal < 0 ? fmtN(-bal) : ""), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, balP >= 0 ? fmtN(balP) : ""), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, balP < 0 ? fmtN(-balP) : ""));
  }), /* @__PURE__ */ React.createElement("tr", { style: { fontWeight: 700, borderTop: "2px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", null, "Total"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmtN(tbDebit)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmtN(tbCredit)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmtN(tbDebitPrev)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", color: "var(--text3)" } }, fmtN(tbCreditPrev))))))))));
};
const advanceDate = (dateStr, freq) => {
  const d = _pd(dateStr || today());
  if (freq === "Weekly") d.setDate(d.getDate() + 7);
  else if (freq === "Quarterly") d.setMonth(d.getMonth() + 3);
  else if (freq === "Yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return _iso(d);
};
const nextDocNo = (label) => {
  const key = SK.CTR + "_" + label + "_" + getFY();
  const c = S.get(key, 1);
  return { no: `${label}/${getFYShort()}/${String(c).padStart(3, "0")}`, commit: () => S.set(key, c + 1) };
};
const blankSimpleItem = () => ({ desc: "", qty: 1, rate: "", unit: "Nos" });
const blankSimpleCustomer = () => ({ name: "", address: "", phone: "", email: "", gstin: "", city: "", state: "", pin: "" });
const SimpleCustomerPicker = ({ customer, onChange }) => {
  const [q, setQ] = useState((customer == null ? void 0 : customer.name) || "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef();
  useEffect(() => {
    setQ((customer == null ? void 0 : customer.name) || "");
  }, [customer == null ? void 0 : customer.name]);
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const customers = S.get(SK.CUST, []);
  const matched = q.length > 1 ? customers.filter((c) => {
    var _a, _b;
    return ((_a = c.name) == null ? void 0 : _a.toLowerCase().includes(q.toLowerCase())) || ((_b = c.gstin) == null ? void 0 : _b.toLowerCase().includes(q.toLowerCase()));
  }).slice(0, 6) : [];
  const pick = (c) => {
    onChange({ name: c.name || "", address: c.address || "", phone: c.phone || "", email: c.email || "", gstin: c.gstin || "", city: c.city || "", state: c.state || "", pin: c.pin || "" });
    setQ(c.name || "");
    setOpen(false);
  };
  return /* @__PURE__ */ React.createElement("div", { ref: wrapRef, style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "field-input",
      value: q,
      onChange: (e) => {
        setQ(e.target.value);
        onChange({ ...customer, name: e.target.value });
        setOpen(true);
      },
      onFocus: () => setOpen(true),
      placeholder: "Type to search saved customers..."
    }
  ), open && matched.length > 0 && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    background: "var(--card)",
    border: "1.5px solid var(--border2)",
    borderRadius: 10,
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    zIndex: 1e3,
    maxHeight: 220,
    overflowY: "auto"
  } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "5px 12px", fontSize: 10, color: "var(--text3)", borderBottom: "1px solid var(--border)", fontWeight: 700, background: "var(--card2)", borderRadius: "10px 10px 0 0" } }, /* @__PURE__ */ React.createElement(Ic, { n: "users", s: 14 }), " ", matched.length, " customer", matched.length !== 1 ? "s" : "", " found"), matched.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "hsn-opt", onMouseDown: (e) => {
    e.preventDefault();
    pick(c);
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, color: "var(--text)" } }, c.name), c.gstin && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontFamily: "monospace", color: "var(--gold)" } }, c.gstin)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)" } }, [c.city, c.state].filter(Boolean).join(", "))))));
};
const convertItemsToInvoice = (customer, items, notes, user) => {
  const mapped = items.filter((it) => it.desc).map((it) => {
    const qty = parseFloat(it.qty) || 0, rate = parseFloat(it.rate) || 0;
    return { desc: it.desc, qty, rate, total: +(qty * rate).toFixed(2) };
  });
  if (mapped.length === 0) return null;
  const subtotal = +mapped.reduce((s, it) => s + it.total, 0).toFixed(2);
  const invNo = peekInvNo("NON GST INVOICE");
  commitInvNo("NON GST INVOICE");
  const inv = {
    ...newInvoice(user, "NON GST INVOICE"),
    invNo,
    billTo: { ...blankSimpleCustomer(), ...customer },
    items: mapped,
    subtotal,
    grand: subtotal,
    notes: notes || "",
    status: "Sent"
  };
  S.set(SK.INV, [...S.get(SK.INV, []), inv]);
  return inv;
};
const QuotationsPage = ({ inline = true, onClose, currentUser }) => {
  const [list, setList] = useState(() => S.get(SK.QUOTE, []));
  const blank = () => ({ id: Date.now().toString(), quoteNo: "", date: today(), validTill: addDaysStr(today(), 15), customer: blankSimpleCustomer(), items: [blankSimpleItem()], notes: "", status: "Draft", convertedInvNo: "" });
  const [form, setForm] = useState(null);
  const persist = (u) => {
    setList(u);
    S.set(SK.QUOTE, u);
  };
  const total = (f) => (f.items || []).reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0), 0);
  const save = () => {
    var _a;
    if (!form.customer.name) {
      toast.error("Customer name required");
      return;
    }
    let f = form;
    const wasExisting = list.some((q) => q.id === f.id);
    if (!f.quoteNo) {
      const { no, commit } = nextDocNo("QUO");
      f = { ...f, quoteNo: no };
      commit();
    }
    persist(wasExisting ? list.map((q) => q.id === f.id ? f : q) : [...list, f]);
    logAudit(wasExisting ? "QUOTATION_EDITED" : "QUOTATION_CREATED", `${f.quoteNo} \u2014 ${((_a = f.customer) == null ? void 0 : _a.name) || ""} \u2014 ${fmt(total(f))}`, currentUser);
    setForm(null);
    toast.success("Quotation saved");
  };
  const del = (id) => {
    var _a;
    if (!window.confirm("Delete this quotation?")) return;
    const q = list.find((x) => x.id === id);
    persist(list.filter((q2) => q2.id !== id));
    logAudit("QUOTATION_DELETED", `${(q == null ? void 0 : q.quoteNo) || ""} \u2014 ${((_a = q == null ? void 0 : q.customer) == null ? void 0 : _a.name) || ""}`, currentUser);
  };
  const setStatus = (id, status) => {
    persist(list.map((q) => q.id === id ? { ...q, status } : q));
  };
  const convert = (q) => {
    if (!window.confirm(`Convert ${q.quoteNo} into a real invoice for ${fmt(total(q))}?`)) return;
    const inv = convertItemsToInvoice(q.customer, q.items, `Converted from Quotation ${q.quoteNo}`, currentUser);
    if (!inv) {
      toast.error("Add at least one item first");
      return;
    }
    persist(list.map((x) => x.id === q.id ? { ...x, status: "Converted", convertedInvNo: inv.invNo } : x));
    logAudit("QUOTATION_CONVERTED", `${q.quoteNo} \u2192 invoice ${inv.invNo}`, currentUser);
    toast.success(`Converted to invoice ${inv.invNo}`);
  };
  return /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card" : "overlay" }, /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card-inner" : "modal" }, !inline && /* @__PURE__ */ React.createElement("div", { className: "modal-hdr" }, /* @__PURE__ */ React.createElement("span", { className: "modal-title" }, /* @__PURE__ */ React.createElement(Ic, { n: "file", s: 18 }), " Quotations / Estimates"), /* @__PURE__ */ React.createElement("button", { className: "close-btn", onClick: onClose }, /* @__PURE__ */ React.createElement(Ic, { n: "x" }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, !form ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { marginBottom: 14 }, onClick: () => setForm(blank()) }, /* @__PURE__ */ React.createElement(Ic, { n: "plus", s: 13 }), " New Quotation"), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "No."), /* @__PURE__ */ React.createElement("th", null, "Date"), /* @__PURE__ */ React.createElement("th", null, "Customer"), /* @__PURE__ */ React.createElement("th", null, "Valid Till"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Amount"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", { style: { width: 220 } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, list.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: 24, color: "var(--text3)" } }, "No quotations yet.")) : [...list].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((q) => {
    var _a;
    return /* @__PURE__ */ React.createElement("tr", { key: q.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 600 } }, q.quoteNo), /* @__PURE__ */ React.createElement("td", null, fmtDate(q.date)), /* @__PURE__ */ React.createElement("td", null, (_a = q.customer) == null ? void 0 : _a.name), /* @__PURE__ */ React.createElement("td", null, fmtDate(q.validTill)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 600 } }, fmt(total(q))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${q.status === "Accepted" || q.status === "Converted" ? "badge-green" : q.status === "Rejected" ? "badge-red" : "badge-gold"}` }, q.status)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setForm(q) }, "Edit"), q.status !== "Converted" && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary", onClick: () => convert(q) }, "Convert"), q.status === "Draft" && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setStatus(q.id, "Sent") }, "Mark Sent"), q.status === "Sent" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setStatus(q.id, "Accepted") }, "Accepted"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setStatus(q.id, "Rejected") }, "Rejected")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => del(q.id) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 })))));
  }))))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", style: { marginBottom: 14 }, onClick: () => setForm(null) }, "\u2190 Back to list"), /* @__PURE__ */ React.createElement("div", { className: "g4", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Date"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: form.date, onChange: (e) => setForm((p) => ({ ...p, date: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Valid Till"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: form.validTill, onChange: (e) => setForm((p) => ({ ...p, validTill: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Customer Name"), /* @__PURE__ */ React.createElement(SimpleCustomerPicker, { customer: form.customer, onChange: (c) => setForm((p) => ({ ...p, customer: c })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Phone"), /* @__PURE__ */ React.createElement("input", { className: "field-input", value: form.customer.phone, onChange: (e) => setForm((p) => ({ ...p, customer: { ...p.customer, phone: e.target.value } })) }))), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "Items"), form.items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("input", { className: "field-input", style: { flex: 3 }, placeholder: "Description", value: it.desc, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { flex: 1 }, placeholder: "Qty", value: it.qty, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, qty: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { flex: 1 }, placeholder: "Rate", value: it.rate, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, rate: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("div", { style: { width: 100, alignSelf: "center", textAlign: "right", fontWeight: 600 } }, fmt((parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => setForm((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) })) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 })))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary", onClick: () => setForm((p) => ({ ...p, items: [...p.items, blankSimpleItem()] })) }, /* @__PURE__ */ React.createElement(Ic, { n: "plus", s: 11 }), " Add Item"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", fontWeight: 700, fontSize: 15, margin: "12px 0" } }, "Total: ", fmt(total(form))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Notes"), /* @__PURE__ */ React.createElement("textarea", { className: "field-input", value: form.notes, onChange: (e) => setForm((p) => ({ ...p, notes: e.target.value })) })), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: save }, "Save Quotation")))));
};
const DeliveryChallanPage = ({ inline = true, onClose, currentUser }) => {
  const [list, setList] = useState(() => S.get(SK.DC, []));
  const blank = () => ({ id: Date.now().toString(), dcNo: "", date: today(), customer: blankSimpleCustomer(), items: [blankSimpleItem()], purpose: "Job Work", vehicleNo: "", transporter: "", notes: "", status: "Dispatched" });
  const [form, setForm] = useState(null);
  const persist = (u) => {
    setList(u);
    S.set(SK.DC, u);
  };
  const save = () => {
    var _a;
    if (!form.customer.name) {
      toast.error("Customer name required");
      return;
    }
    let f = form;
    const wasExisting = list.some((d) => d.id === f.id);
    if (!f.dcNo) {
      const { no, commit } = nextDocNo("DC");
      f = { ...f, dcNo: no };
      commit();
    }
    persist(wasExisting ? list.map((d) => d.id === f.id ? f : d) : [...list, f]);
    logAudit(wasExisting ? "DC_EDITED" : "DC_CREATED", `${f.dcNo} \u2014 ${((_a = f.customer) == null ? void 0 : _a.name) || ""}`, currentUser);
    setForm(null);
    toast.success("Delivery Challan saved");
  };
  const del = (id) => {
    var _a;
    if (!window.confirm("Delete this delivery challan?")) return;
    const d = list.find((x) => x.id === id);
    persist(list.filter((d2) => d2.id !== id));
    logAudit("DC_DELETED", `${(d == null ? void 0 : d.dcNo) || ""} \u2014 ${((_a = d == null ? void 0 : d.customer) == null ? void 0 : _a.name) || ""}`, currentUser);
  };
  return /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card" : "overlay" }, /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card-inner" : "modal" }, !inline && /* @__PURE__ */ React.createElement("div", { className: "modal-hdr" }, /* @__PURE__ */ React.createElement("span", { className: "modal-title" }, /* @__PURE__ */ React.createElement(Ic, { n: "package", s: 18 }), " Delivery Challans"), /* @__PURE__ */ React.createElement("button", { className: "close-btn", onClick: onClose }, /* @__PURE__ */ React.createElement(Ic, { n: "x" }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, !form ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { marginBottom: 14 }, onClick: () => setForm(blank()) }, /* @__PURE__ */ React.createElement(Ic, { n: "plus", s: 13 }), " New Delivery Challan"), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "No."), /* @__PURE__ */ React.createElement("th", null, "Date"), /* @__PURE__ */ React.createElement("th", null, "Customer"), /* @__PURE__ */ React.createElement("th", null, "Purpose"), /* @__PURE__ */ React.createElement("th", null, "# Items"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", { style: { width: 140 } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, list.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: 24, color: "var(--text3)" } }, "No delivery challans yet.")) : [...list].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((d) => {
    var _a;
    return /* @__PURE__ */ React.createElement("tr", { key: d.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 600 } }, d.dcNo), /* @__PURE__ */ React.createElement("td", null, fmtDate(d.date)), /* @__PURE__ */ React.createElement("td", null, (_a = d.customer) == null ? void 0 : _a.name), /* @__PURE__ */ React.createElement("td", null, d.purpose), /* @__PURE__ */ React.createElement("td", null, (d.items || []).filter((it) => it.desc).length), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${d.status === "Delivered" ? "badge-green" : "badge-gold"}` }, d.status)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setForm(d) }, "Edit"), d.status !== "Delivered" && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary", onClick: () => persist(list.map((x) => x.id === d.id ? { ...x, status: "Delivered" } : x)) }, "Mark Delivered"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => del(d.id) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 })))));
  }))))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", style: { marginBottom: 14 }, onClick: () => setForm(null) }, "\u2190 Back to list"), /* @__PURE__ */ React.createElement("div", { className: "g4", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Date"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: form.date, onChange: (e) => setForm((p) => ({ ...p, date: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Purpose"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: form.purpose, onChange: (e) => setForm((p) => ({ ...p, purpose: e.target.value })) }, /* @__PURE__ */ React.createElement("option", null, "Job Work"), /* @__PURE__ */ React.createElement("option", null, "Sale on Approval"), /* @__PURE__ */ React.createElement("option", null, "Return"), /* @__PURE__ */ React.createElement("option", null, "Other"))), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Vehicle No."), /* @__PURE__ */ React.createElement("input", { className: "field-input", value: form.vehicleNo, onChange: (e) => setForm((p) => ({ ...p, vehicleNo: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Transporter"), /* @__PURE__ */ React.createElement("input", { className: "field-input", value: form.transporter, onChange: (e) => setForm((p) => ({ ...p, transporter: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 12, maxWidth: 400 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Customer Name"), /* @__PURE__ */ React.createElement(SimpleCustomerPicker, { customer: form.customer, onChange: (c) => setForm((p) => ({ ...p, customer: c })) })), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "Items"), form.items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("input", { className: "field-input", style: { flex: 3 }, placeholder: "Description", value: it.desc, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { flex: 1 }, placeholder: "Qty", value: it.qty, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, qty: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("input", { className: "field-input", style: { flex: 1 }, placeholder: "Unit", value: it.unit, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, unit: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => setForm((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) })) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 })))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary", onClick: () => setForm((p) => ({ ...p, items: [...p.items, blankSimpleItem()] })) }, /* @__PURE__ */ React.createElement(Ic, { n: "plus", s: 11 }), " Add Item"), /* @__PURE__ */ React.createElement("div", { className: "field", style: { margin: "12px 0" } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Notes"), /* @__PURE__ */ React.createElement("textarea", { className: "field-input", value: form.notes, onChange: (e) => setForm((p) => ({ ...p, notes: e.target.value })) })), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: save }, "Save Delivery Challan")))));
};
