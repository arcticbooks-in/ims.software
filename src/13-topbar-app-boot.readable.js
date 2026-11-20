const CashFlowRatiosPage = ({ currentUser }) => {
  const [tab, setTab] = useState("cashflow");
  const [selFY, setSelFY] = useState(getFY());
  const [from, setFrom] = useState(fyStartOf(getFY()));
  const [to, setTo] = useState(today());
  const pickFY = (y) => {
    setSelFY(y);
    setFrom(fyStartOf(y));
    const e = fyEndOf(y);
    setTo(e < today() ? e : today());
  };
  const cf = useMemo(() => getCashFlow(from, to), [from, to]);
  const rt = useMemo(() => getRatios(from, to), [from, to]);
  const rtPrev = useMemo(() => getRatios(shiftYear(from, -1), shiftYear(to, -1)), [from, to]);
  const prevMap = {};
  rtPrev.list.forEach((x) => {
    prevMap[x.k] = x.v;
  });
  const col = { good: "var(--green)", warn: "var(--gold)", bad: "var(--red)" };
  const [drill, setDrill] = useState([]);
  useEffect(() => {
    setDrill([]);
  }, [tab, from, to]);
  const lnk = { cursor: "pointer", color: "var(--primary2)", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 };
  const pushDrill = (title, rows) => setDrill((d) => [...d, { title, rows }]);
  const pushLedger = (account) => setDrill((d) => [...d, { ledger: account, title: coaByKey(account).name }]);
  const itemRows = (items) => (items || []).map((it) => ({ label: coaByKey(it.account).name, amount: it.amount, account: it.account }));
  const rowOpen = (r) => r.account ? () => pushLedger(r.account) : r.items && r.items.length ? () => pushDrill(r.label, itemRows(r.items)) : null;
  const D = ({ on, children }) => on ? /* @__PURE__ */ React.createElement("span", { style: lnk, title: "Click to see the line items", onClick: on }, children) : /* @__PURE__ */ React.createElement(React.Fragment, null, children);
  const secRows = (rows) => rows.map((r) => ({ label: r.label, amount: r.amount, items: r.items }));
  const opRows = () => [{ label: "Net profit for the period", amount: cf.netProfit, items: cf.netProfitItems }, ...secRows(cf.adj), ...secRows(cf.wc)];
  const Line = ({ r, pad = 28, prefix = "" }) => {
    const on = rowOpen(r);
    return /* @__PURE__ */ React.createElement("tr", { style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, paddingLeft: pad } }, /* @__PURE__ */ React.createElement(D, { on }, prefix, r.label)), /* @__PURE__ */ React.createElement("td", { style: tdR }, /* @__PURE__ */ React.createElement(D, { on }, fmt(r.amount))));
  };
  const Total = ({ label, amount, rows, color }) => {
    const on = rows && rows.length ? () => pushDrill(label, rows) : null;
    return /* @__PURE__ */ React.createElement("tr", { style: { borderBottom: "2px solid var(--border2)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 800 } }, /* @__PURE__ */ React.createElement(D, { on }, label)), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 800, color } }, /* @__PURE__ */ React.createElement(D, { on }, fmt(amount))));
  };
  const Sec = ({ title, rows, total, totalLabel }) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)" } }, /* @__PURE__ */ React.createElement("td", { colSpan: 2, style: { ...td, fontWeight: 800, fontSize: 12.5 } }, title)), rows.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: { ...td, paddingLeft: 28, color: "var(--text3)" } }, "No movement"), /* @__PURE__ */ React.createElement("td", { style: tdR }, "\u2014")), rows.map((r, i) => /* @__PURE__ */ React.createElement(Line, { key: i, r })), /* @__PURE__ */ React.createElement(Total, { label: totalLabel, amount: total, rows: secRows(rows), color: total >= 0 ? "var(--green)" : "var(--red)" }));
  const cashRows = (which) => cf.cashItems.map((c) => ({ label: coaByKey(c.account).name, amount: which === "open" ? c.open : c.close, account: c.account }));
  const doExport = (f) => {
    if (tab === "cashflow") {
      const rows = [["Net profit for the period", fmtN(cf.netProfit)], ...cf.adj.map((r) => ["  " + r.label, fmtN(r.amount)]), ...cf.wc.map((r) => ["  " + r.label, fmtN(r.amount)]), ["NET CASH FROM OPERATING ACTIVITIES", fmtN(cf.cfo)], ...cf.invAll.map((r) => ["  " + r.label, fmtN(r.amount)]), ["NET CASH FROM INVESTING ACTIVITIES", fmtN(cf.cfi)], ...cf.fin.map((r) => ["  " + r.label, fmtN(r.amount)]), ["NET CASH FROM FINANCING ACTIVITIES", fmtN(cf.cff)], ["NET INCREASE / (DECREASE) IN CASH", fmtN(cf.netChange)], ["Cash & bank \u2014 opening", fmtN(cf.cashOpen)], ["Cash & bank \u2014 closing", fmtN(cf.cashClose)]];
      exportTableAs(f, `CashFlow_${from}_to_${to}`, `Cash Flow Statement (${fmtDate(from)} to ${fmtDate(to)})`, ["Particulars", "Amount (Rs)"], rows);
    } else exportTableAs(f, `Ratios_${from}_to_${to}`, `Ratio Analysis (${fmtDate(from)} to ${fmtDate(to)})`, ["Group", "Ratio", "This period", "Previous year", "How it is calculated"], rt.list.map((x) => [x.g, x.label, fmtRatio(x.v, x.t), fmtRatio(prevMap[x.k], x.t), x.note]));
  };
  const groups = ["Liquidity", "Profitability", "Leverage", "Efficiency"];
  const top = drill[drill.length - 1];
  if (top) {
    const crumbs = [{ label: "Cash Flow Statement", onClick: () => setDrill([]) }, ...drill.map((d, i) => ({ label: d.title, onClick: i < drill.length - 1 ? () => setDrill(drill.slice(0, i + 1)) : void 0 }))];
    if (top.ledger) return /* @__PURE__ */ React.createElement(PageShell, null, /* @__PURE__ */ React.createElement(Breadcrumb, { items: crumbs }), /* @__PURE__ */ React.createElement(LedgerTable, { account: top.ledger, fromDate: from, toDate: to }));
    const tot = r2(top.rows.reduce((x, r) => x + (+r.amount || 0), 0));
    return /* @__PURE__ */ React.createElement(PageShell, null, /* @__PURE__ */ React.createElement(Breadcrumb, { items: crumbs }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text3)", marginBottom: 10 } }, fmtDate(from), " to ", fmtDate(to), " \xB7 click a ledger to see its transactions"), /* @__PURE__ */ React.createElement(Wrap, { min: 420 }, /* @__PURE__ */ React.createElement("tbody", null, top.rows.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: { ...td, color: "var(--text3)" } }, "Nothing to show"), /* @__PURE__ */ React.createElement("td", { style: tdR }, "\u2014")), top.rows.map((r, i) => {
      const on = r.account ? () => pushLedger(r.account) : r.sub ? () => pushDrill(r.label, r.sub) : r.items && r.items.length ? () => pushDrill(r.label, itemRows(r.items)) : null;
      return /* @__PURE__ */ React.createElement("tr", { key: i, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, /* @__PURE__ */ React.createElement(D, { on }, r.label)), /* @__PURE__ */ React.createElement("td", { style: tdR }, /* @__PURE__ */ React.createElement(D, { on }, fmt(r.amount))));
    }), /* @__PURE__ */ React.createElement("tr", { style: { borderTop: "2px solid var(--border2)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 800 } }, "Total"), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 800 } }, fmt(tot))))));
  }
  return /* @__PURE__ */ React.createElement(PageShell, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 12 } }, /* @__PURE__ */ React.createElement(FyPicker, { value: selFY, onChange: pickFY }), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "From"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: from, onChange: (e) => setFrom(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "To"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: to, onChange: (e) => setTo(e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(ExportMenu, { onExport: doExport })), /* @__PURE__ */ React.createElement(TabBar, { value: tab, onChange: setTab, tabs: [["cashflow", "Cash Flow Statement"], ["ratios", "Ratio Analysis"]] }), tab === "cashflow" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Kpi, { label: "Operating", value: fmt(cf.cfo), color: cf.cfo >= 0 ? "var(--green)" : "var(--red)" }), /* @__PURE__ */ React.createElement(Kpi, { label: "Investing", value: fmt(cf.cfi), color: cf.cfi >= 0 ? "var(--green)" : "var(--gold)" }), /* @__PURE__ */ React.createElement(Kpi, { label: "Financing", value: fmt(cf.cff) }), /* @__PURE__ */ React.createElement(Kpi, { label: "Closing cash & bank", value: fmt(cf.cashClose), color: "var(--primary2)" })), /* @__PURE__ */ React.createElement(Wrap, { min: 560 }, /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 800 } }, /* @__PURE__ */ React.createElement(D, { on: () => pushDrill("Operating activities", opRows()) }, "A. Cash flow from operating activities")), /* @__PURE__ */ React.createElement("td", { style: tdR })), /* @__PURE__ */ React.createElement(Line, { r: { label: "Net profit for the period", amount: cf.netProfit, items: cf.netProfitItems } }), cf.adj.map((r, i) => /* @__PURE__ */ React.createElement(Line, { key: "a" + i, r, prefix: "Add / (less): " })), cf.wc.map((r, i) => /* @__PURE__ */ React.createElement(Line, { key: "w" + i, r })), /* @__PURE__ */ React.createElement(Total, { label: "Net cash from operating activities", amount: cf.cfo, rows: opRows(), color: cf.cfo >= 0 ? "var(--green)" : "var(--red)" }), /* @__PURE__ */ React.createElement(Sec, { title: "B. Cash flow from investing activities", rows: cf.invAll, total: cf.cfi, totalLabel: "Net cash from investing activities" }), /* @__PURE__ */ React.createElement(Sec, { title: "C. Cash flow from financing activities", rows: cf.fin, total: cf.cff, totalLabel: "Net cash from financing activities" }), /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 800 } }, /* @__PURE__ */ React.createElement(D, { on: () => pushDrill("Net increase / (decrease) in cash", [{ label: "Operating activities", amount: cf.cfo, items: null, sub: opRows() }, { label: "Investing activities", amount: cf.cfi, sub: secRows(cf.invAll) }, { label: "Financing activities", amount: cf.cff, sub: secRows(cf.fin) }]) }, "Net increase / (decrease) in cash (A+B+C)")), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 800 } }, fmt(cf.netChange))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: td }, /* @__PURE__ */ React.createElement(D, { on: () => pushDrill("Cash & bank at the beginning", cashRows("open")) }, "Cash & bank at the beginning")), /* @__PURE__ */ React.createElement("td", { style: tdR }, /* @__PURE__ */ React.createElement(D, { on: () => pushDrill("Cash & bank at the beginning", cashRows("open")) }, fmt(cf.cashOpen)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 800 } }, /* @__PURE__ */ React.createElement(D, { on: () => pushDrill("Cash & bank at the end", cashRows("close")) }, "Cash & bank at the end")), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 800 } }, /* @__PURE__ */ React.createElement(D, { on: () => pushDrill("Cash & bank at the end", cashRows("close")) }, fmt(cf.cashClose)))))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, fontSize: 12, color: Math.abs(cf.diff) < 0.5 ? "var(--green)" : "var(--red)" } }, Math.abs(cf.diff) < 0.5 ? "\u2713 Ties to the closing balance of your Cash & Bank ledgers." : "\u26A0 Difference of " + fmt(cf.diff) + " against ledger cash \u2014 check for entries dated outside the period."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", marginTop: 4 } }, "Indirect method (AS-3 / Ind AS 7). Interest paid is left inside operating activities.")), tab === "ratios" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text3)", marginBottom: 12 } }, "Period of ", rt.base.days, " days \xB7 revenue ", fmt(rt.base.revenue), " \xB7 net profit ", fmt(rt.base.np), ". Compared with the same period last year."), groups.map((g) => /* @__PURE__ */ React.createElement("div", { key: g, style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 13, marginBottom: 8 } }, g), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 10 } }, rt.list.filter((x) => x.g === g).map((x) => {
    const st = x.v == null ? null : x.good(x.v);
    const pv = prevMap[x.k];
    return /* @__PURE__ */ React.createElement("div", { key: x.k, className: "card", style: { padding: "12px 14px", borderLeft: `3px solid ${st ? col[st] : "var(--border2)"}` }, title: x.note }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", fontWeight: 600 } }, x.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 21, fontWeight: 800, fontFamily: "Sora,sans-serif", color: st ? col[st] : "var(--text3)", margin: "4px 0" } }, fmtRatio(x.v, x.t)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text3)" } }, "Last year: ", fmtRatio(pv, x.t)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text3)", marginTop: 4, lineHeight: 1.35 } }, x.note));
  }))))));
};
const BudgetPage = ({ currentUser }) => {
  const [selFY, setSelFY] = useState(getFY());
  const [kind, setKind] = useState("expense");
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({});
  const nowIdx = ((/* @__PURE__ */ new Date()).getMonth() + 9) % 12;
  const [m1, setM1] = useState(0);
  const [m2, setM2] = useState(selFY === getFY() ? nowIdx : 11);
  const [uplift, setUplift] = useState("10");
  const [tick, setTick] = useState(0);
  const budget = useMemo(() => getBudgetFY(selFY), [selFY, tick]);
  const actual = useMemo(() => getMonthlyActuals(selFY), [selFY, tick]);
  const accts = getAllAccounts().filter((a) => a.type === kind && !a.groupOnly);
  const sumR = (arr, a, b) => (arr || new Array(12).fill(0)).slice(a, b + 1).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const heads = accts.filter((a) => edit || sumR(budget[a.key], 0, 11) !== 0 || sumR(actual[a.key], 0, 11) !== 0);
  const changeFY = (y) => {
    setSelFY(y);
    setM1(0);
    setM2(y === getFY() ? nowIdx : 11);
    setEdit(false);
  };
  const rows = heads.map((a) => {
    const b = sumR(budget[a.key], m1, m2), ac = sumR(actual[a.key], m1, m2);
    const isExp = kind === "expense";
    const variance = isExp ? r2(b - ac) : r2(ac - b);
    const pct = b > 0 ? ac / b * 100 : ac > 0 ? 999 : 0;
    const st = b <= 0 ? ac > 0 ? "unbudgeted" : "none" : isExp ? pct > 100 ? "over" : pct >= 90 ? "near" : "ok" : pct >= 100 ? "ok" : pct >= 80 ? "near" : "over";
    return { a, b, ac, variance, pct, st };
  });
  const tb = rows.reduce((s, r) => s + r.b, 0), ta = rows.reduce((s, r) => s + r.ac, 0), overN = rows.filter((r) => r.st === "over" || r.st === "unbudgeted").length;
  const stCol = { ok: "var(--green)", near: "var(--gold)", over: "var(--red)", unbudgeted: "var(--red)", none: "var(--text3)" };
  const stTxt = kind === "expense" ? { ok: "Within budget", near: "Near limit", over: "Over budget", unbudgeted: "No budget set", none: "" } : { ok: "On target", near: "Slightly behind", over: "Behind target", unbudgeted: "No target set", none: "" };
  const startEdit = () => {
    const d = {};
    accts.forEach((a) => {
      d[a.key] = (budget[a.key] || new Array(12).fill(0)).map((v) => v || "");
    });
    setDraft(d);
    setEdit(true);
  };
  const setM = (k, i, v) => setDraft((d) => ({ ...d, [k]: d[k].map((x, j) => j === i ? v : x) }));
  const setAnnual = (k, v) => {
    const n = parseFloat(v) || 0;
    setDraft((d) => ({ ...d, [k]: new Array(12).fill(0).map((_, i) => n ? r2(n / 12) : "") }));
  };
  const fromLY = () => {
    const ly = getMonthlyActuals(selFY - 1), f = 1 + (parseFloat(uplift) || 0) / 100;
    setDraft((d) => {
      const n = { ...d };
      accts.forEach((a) => {
        if (ly[a.key]) n[a.key] = ly[a.key].map((v) => v ? r2(v * f) : "");
      });
      return n;
    });
    toast.info(`Filled from FY ${selFY - 1} actuals +${uplift || 0}% \u2014 review and save`);
  };
  const saveDraft = () => {
    const all = { ...budget };
    accts.forEach((a) => {
      const arr = (draft[a.key] || []).map((v) => parseFloat(v) || 0);
      if (arr.some((v) => v)) all[a.key] = arr;
      else delete all[a.key];
    });
    saveBudgetFY(selFY, all);
    logAudit("BUDGET_SAVED", `FY ${selFY}-${String(selFY + 1).slice(2)} ${kind}`, currentUser);
    setEdit(false);
    setTick((t) => t + 1);
    toast.success("Budget saved");
  };
  const doExport = (f) => exportTableAs(
    f,
    `Budget_vs_Actual_FY${selFY}_${kind}`,
    `Budget vs Actual \u2014 ${kind === "expense" ? "Expense" : "Income"} heads (${FY_MONTHS[m1]} to ${FY_MONTHS[m2]} FY ${selFY}-${String(selFY + 1).slice(2)})`,
    ["Head", "Budget", "Actual", "Variance", "% used"],
    [...rows.map((r) => [r.a.name, fmtN(r.b), fmtN(r.ac), fmtN(r.variance), r.b > 0 ? r.pct.toFixed(1) + "%" : "\u2014"]), ["Total", fmtN(tb), fmtN(ta), fmtN(kind === "expense" ? tb - ta : ta - tb), tb > 0 ? (ta / tb * 100).toFixed(1) + "%" : "\u2014"]]
  );
  return /* @__PURE__ */ React.createElement(PageShell, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 12 } }, /* @__PURE__ */ React.createElement(FyPicker, { value: selFY, onChange: changeFY }), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "From month"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: m1, onChange: (e) => setM1(Math.min(+e.target.value, m2)) }, FY_MONTHS.map((m, i) => /* @__PURE__ */ React.createElement("option", { key: m, value: i }, m)))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "To month"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: m2, onChange: (e) => setM2(Math.max(+e.target.value, m1)) }, FY_MONTHS.map((m, i) => /* @__PURE__ */ React.createElement("option", { key: m, value: i }, m)))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), !edit && /* @__PURE__ */ React.createElement(ExportMenu, { onExport: doExport, disabled: !rows.length }), !edit ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: startEdit }, "Set / edit budget") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: saveDraft }, "Save budget"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: () => setEdit(false) }, "Cancel"))), /* @__PURE__ */ React.createElement(TabBar, { value: kind, onChange: (k) => {
    setKind(k);
    setEdit(false);
  }, tabs: [["expense", "Expense heads"], ["income", "Income heads"]] }), !edit && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Kpi, { label: "Budget", value: fmt(tb) }), /* @__PURE__ */ React.createElement(Kpi, { label: "Actual", value: fmt(ta), color: "var(--primary2)" }), /* @__PURE__ */ React.createElement(Kpi, { label: kind === "expense" ? "Remaining / (overspent)" : "Ahead / (behind)", value: fmt(kind === "expense" ? tb - ta : ta - tb), color: (kind === "expense" ? tb - ta : ta - tb) >= 0 ? "var(--green)" : "var(--red)" }), /* @__PURE__ */ React.createElement(Kpi, { label: "Heads needing attention", value: String(overN), color: overN ? "var(--red)" : "var(--green)", sub: kind === "expense" ? "over budget or unbudgeted" : "behind target" })), rows.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "No budget or activity yet. Click \u201CSet / edit budget\u201D to enter one for each head." }) : /* @__PURE__ */ React.createElement(Wrap, { min: 820 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Head"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Budget"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Actual"), /* @__PURE__ */ React.createElement("th", { style: thR }, kind === "expense" ? "Remaining" : "Ahead/(behind)"), /* @__PURE__ */ React.createElement("th", { style: { ...th, minWidth: 170 } }, "Used"), /* @__PURE__ */ React.createElement("th", { style: th }, "Status")), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.a.key, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 600 } }, r.a.name), /* @__PURE__ */ React.createElement("td", { style: tdR }, r.b ? fmt(r.b) : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(r.ac)), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 700, color: r.variance >= 0 ? "var(--green)" : "var(--red)" } }, r.b || r.ac ? fmt(r.variance) : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: td }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 7, background: "var(--card3)", borderRadius: 4, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: Math.min(100, r.pct) + "%", height: "100%", background: stCol[r.st] } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, minWidth: 40, textAlign: "right" } }, r.b > 0 ? r.pct.toFixed(0) + "%" : "\u2014"))), /* @__PURE__ */ React.createElement("td", { style: { ...td, color: stCol[r.st], fontWeight: 600, fontSize: 11.5 } }, stTxt[r.st]))), /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)", fontWeight: 800 } }, /* @__PURE__ */ React.createElement("td", { style: td }, "Total"), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(tb)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(ta)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(kind === "expense" ? tb - ta : ta - tb)), /* @__PURE__ */ React.createElement("td", { style: td }, tb > 0 ? (ta / tb * 100).toFixed(0) + "%" : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: td }))))), edit && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(InfoNote, null, "Type a ", /* @__PURE__ */ React.createElement("b", null, "yearly"), " figure to spread it evenly across the 12 months, or type each month yourself (seasonal costs). Leave a head blank for no budget. Actuals come straight from the ledger."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12 } }, "Quick fill from last year\u2019s actuals, plus"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { width: 70, padding: "5px 8px" }, value: uplift, onChange: (e) => setUplift(e.target.value) }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12 } }, "%"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary", onClick: fromLY }, "Fill budget")), /* @__PURE__ */ React.createElement("div", { style: { overflow: "auto", maxHeight: "58vh", border: "1px solid var(--border)", borderRadius: 10 } }, /* @__PURE__ */ React.createElement("table", { style: { borderCollapse: "collapse", minWidth: 1250, width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)", position: "sticky", top: 0, zIndex: 2 } }, /* @__PURE__ */ React.createElement("th", { style: { ...th, minWidth: 200 } }, "Head"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Yearly"), FY_MONTHS.map((m) => /* @__PURE__ */ React.createElement("th", { key: m, style: thR }, m)))), /* @__PURE__ */ React.createElement("tbody", null, accts.map((a) => {
    const arr = draft[a.key] || new Array(12).fill("");
    const yr = r2(arr.reduce((s, v) => s + (parseFloat(v) || 0), 0));
    return /* @__PURE__ */ React.createElement("tr", { key: a.key, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 600 } }, a.name), /* @__PURE__ */ React.createElement("td", { style: { padding: "4px 6px" } }, /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { width: 100, padding: "5px 6px", textAlign: "right" }, value: yr || "", onChange: (e) => setAnnual(a.key, e.target.value), placeholder: "0" })), arr.map((v, i) => /* @__PURE__ */ React.createElement("td", { key: i, style: { padding: "4px 3px" } }, /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { width: 74, padding: "5px 5px", textAlign: "right", fontSize: 11.5 }, value: v, onChange: (e) => setM(a.key, i, e.target.value) }))));
  }))))));
};
const PAGE_TITLES = {
  invoice: "New Invoice",
  history: "Invoice History",
  pohistory: "Purchase Orders",
  expenses: "Purchases",
  customers: "Customer Database",
  dashboard: "Dashboard",
  company: "Company Settings",
  hsn: "HSN / SAC Database",
  terms: "Terms & Conditions",
  admin: "Admin Panel",
  inventory: "Inventory & Stock",
  aging: "Ageing \u2014 Receivables & Payables",
  bankrecon: "Bank Reconciliation",
  salesview: "Sales",
  reports: "Financial Statements",
  coa: "Chart of Accounts",
  journal: "Journal Vouchers",
  ledger: "General Ledger",
  trialbalance: "Trial Balance",
  cashflow: "Cash Flow & Ratio Analysis",
  budget: "Budget vs Actual",
  fixedassets: "Fixed Asset Register",
  recjournal: "Recurring Journal Vouchers",
  advances: "Advance & Credit Note Application",
  fxpage: "Multi-Currency & Exchange Gain/Loss",
  quotations: "Quotations / Estimates",
  dc: "Delivery Challans",
  recurring: "Recurring Invoices",
  reminders: "Payment Reminders"
};
const PAGE_SECTIONS = {
  invoice: "Sales",
  history: "Sales",
  quotations: "Sales",
  dc: "Sales",
  recurring: "Sales",
  salesview: "Sales",
  reminders: "Sales",
  customers: "Sales",
  pohistory: "Purchases",
  expenses: "Purchases",
  inventory: "Inventory",
  dashboard: "Overview",
  aging: "Accounting",
  bankrecon: "Accounting",
  reports: "Accounting",
  coa: "Accounting",
  journal: "Accounting",
  ledger: "Accounting",
  trialbalance: "Accounting",
  cashflow: "Accounting",
  budget: "Accounting",
  fixedassets: "Accounting",
  recjournal: "Accounting",
  advances: "Accounting",
  fxpage: "Accounting",
  company: "Settings",
  hsn: "Settings",
  terms: "Settings",
  admin: "Settings"
};
const SEARCHABLE_PAGES = ["history", "pohistory", "expenses", "customers", "hsn"];
const useClickAway = (ref, fn) => {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) fn();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
};
const TopSearch = ({ page, value, onChange, onGoSearch }) => {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === "k") {
        e.preventDefault();
        window.dispatchEvent(new Event("ab-palette"));
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const can = SEARCHABLE_PAGES.includes(page);
  return /* @__PURE__ */ React.createElement("div", { className: "tb2-search" }, /* @__PURE__ */ React.createElement(Ic, { n: "search", s: 14 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      ref,
      value,
      onChange: (e) => onChange(e.target.value),
      placeholder: can ? "Search this list\u2026" : "Search\u2026  (Enter)",
      onKeyDown: (e) => {
        if (e.key === "Enter" && !can && value.trim()) onGoSearch();
        if (e.key === "Escape") {
          onChange("");
          e.target.blur();
        }
      }
    }
  ), value ? /* @__PURE__ */ React.createElement("button", { className: "tb2-clear", title: "Clear", onClick: () => onChange("") }, /* @__PURE__ */ React.createElement(Ic, { n: "x", s: 11 })) : /* @__PURE__ */ React.createElement("kbd", { style: { cursor: "pointer" }, title: "Open command palette", onClick: () => window.dispatchEvent(new Event("ab-palette")) }, "Ctrl K"));
};
const TopQuickCreate = ({ user, canSee: canSee2, go, newInvoice: newInvoice2 }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickAway(ref, () => setOpen(false));
  const items = [
    ["Sales invoice", "Create a GST invoice", () => newInvoice2(), "file", true],
    ["Purchase bill", "Record a vendor bill", () => go("expenses"), "cart", canSee2(user.role, "expenses")],
    ["Journal voucher", "Manual accounting entry", () => go("journal"), "list", canSee2(user.role, "reports")],
    ["Bank entry", "Match receipts & payments", () => go("bankrecon"), "bank", canSee2(user.role, "bankrecon")],
    ["Customer", "Add to customer database", () => go("customers"), "users", canSee2(user.role, "customers")]
  ].filter((x) => x[4]);
  return /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-wrap", ref }, /* @__PURE__ */ React.createElement("button", { className: "tb2-new", onClick: () => setOpen((o) => !o) }, /* @__PURE__ */ React.createElement(Ic, { n: "plus", s: 14 }), /* @__PURE__ */ React.createElement("span", { className: "tb2-hide-sm" }, "New"), /* @__PURE__ */ React.createElement(Ic, { n: "chevron", s: 10 })), open && /* @__PURE__ */ React.createElement("div", { className: "tb2-menu", style: { right: 0, minWidth: 250 } }, /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-head" }, "Create new"), items.map(([t, sub, fn, ic]) => /* @__PURE__ */ React.createElement("div", { key: t, className: "tb2-menu-item", onClick: () => {
    setOpen(false);
    fn();
  } }, /* @__PURE__ */ React.createElement("span", { className: "tb2-menu-ic" }, /* @__PURE__ */ React.createElement(Ic, { n: ic, s: 14 })), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-t" }, t), /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-s" }, sub))))));
};
const SyncDot = () => {
  const [ok, setOk] = useState(_cloudReady);
  useEffect(() => {
    const t = setInterval(() => setOk(_cloudReady), 4e3);
    return () => clearInterval(t);
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "tb2-sync " + (ok ? "ok" : "off"), title: ok ? "Connected \u2014 all changes are saved to the cloud" : "Offline \u2014 changes will NOT be saved until the connection returns" }, /* @__PURE__ */ React.createElement("span", { className: "tb2-sync-dot" }), /* @__PURE__ */ React.createElement("span", { className: "tb2-hide-md" }, ok ? "Synced" : "Offline"));
};
const TopUserMenu = ({ user, theme, setTheme, logout, goCompany }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickAway(ref, () => setOpen(false));
  return /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-wrap", ref }, /* @__PURE__ */ React.createElement("div", { className: "tb2-user" + (open ? " open" : ""), onClick: () => setOpen((o) => !o) }, /* @__PURE__ */ React.createElement("div", { className: "tb2-avatar" }, (user.name || "?")[0].toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "tb2-user-txt tb2-hide-sm" }, /* @__PURE__ */ React.createElement("div", { className: "tb2-user-name" }, user.name), /* @__PURE__ */ React.createElement("div", { className: "tb2-role" }, user.role)), /* @__PURE__ */ React.createElement(Ic, { n: "chevron", s: 10 })), open && /* @__PURE__ */ React.createElement("div", { className: "tb2-menu", style: { right: 0, minWidth: 220 } }, /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-head", style: { textTransform: "none", letterSpacing: 0 } }, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--text)", fontSize: 13 } }, user.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", fontWeight: 500 } }, user.email || user.role)), /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-item", onClick: () => {
    setTheme((t) => t === "dark" ? "light" : "dark");
    setOpen(false);
  } }, /* @__PURE__ */ React.createElement("span", { className: "tb2-menu-ic" }, /* @__PURE__ */ React.createElement(Ic, { n: theme === "dark" ? "sun" : "moon", s: 14 })), /* @__PURE__ */ React.createElement("span", { className: "tb2-menu-t" }, theme === "dark" ? "Switch to light mode" : "Switch to dark mode")), /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-item", onClick: () => {
    setOpen(false);
    goCompany();
  } }, /* @__PURE__ */ React.createElement("span", { className: "tb2-menu-ic" }, /* @__PURE__ */ React.createElement(Ic, { n: "settings", s: 14 })), /* @__PURE__ */ React.createElement("span", { className: "tb2-menu-t" }, "Company settings")), /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-sep" }), /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-item danger", onClick: () => {
    setOpen(false);
    logout();
  } }, /* @__PURE__ */ React.createElement("span", { className: "tb2-menu-ic" }, /* @__PURE__ */ React.createElement(Ic, { n: "logout", s: 14 })), /* @__PURE__ */ React.createElement("span", { className: "tb2-menu-t" }, "Log out"))));
};
const fmtShort = (n) => {
  const v = Math.abs(Number(n) || 0), sg = (Number(n) || 0) < 0 ? "-" : "";
  return v >= 1e7 ? `${sg}\u20B9${(v / 1e7).toFixed(2)} Cr` : v >= 1e5 ? `${sg}\u20B9${(v / 1e5).toFixed(2)} L` : `${sg}\u20B9${Math.round(v).toLocaleString("en-IN")}`;
};
const computePulse = () => {
  const td2 = today(), in7 = addDaysISO(td2, 7);
  const ar = getOpenItems("credit"), ap = getOpenItems("debit");
  const sum = (a) => r2(a.reduce((s, o) => s + o.out, 0));
  const dueOf = (o) => o.due || o.date || td2;
  const arOver = ar.filter((o) => dueOf(o) < td2), apOver = ap.filter((o) => dueOf(o) < td2);
  const arSoon = ar.filter((o) => dueOf(o) >= td2 && dueOf(o) <= in7), apSoon = ap.filter((o) => dueOf(o) >= td2 && dueOf(o) <= in7);
  const unrec = (S.get(SK.BANK, []) || []).filter((t) => !t.matched).length;
  const cn = getOpenCreditNotes(), adv = getAdvanceRows().filter((r) => r.balance > 0.01);
  const rj = (S.get(SK.RJV, []) || []).filter((t) => {
    const g = parseInt(t.generated, 10) || 0;
    return t.active && g < rjvTotal(t) && rjvDate(t, g) <= td2;
  }).length;
  const tb = getTrialBalance(td2);
  const cash = r2(tb.filter((r) => isCashAcct(coaByKey(r.account))).reduce((s, r) => s + r.balance, 0));
  const over = [];
  const fy = getFY();
  const bud = getBudgetFY(fy);
  const bk = Object.keys(bud);
  if (bk.length) {
    const act = getMonthlyActuals(fy);
    const mi = ((/* @__PURE__ */ new Date()).getMonth() + 9) % 12;
    bk.forEach((k) => {
      const a = coaByKey(k);
      if (a.type !== "expense") return;
      const b = (bud[k] || []).slice(0, mi + 1).reduce((s, v) => s + (+v || 0), 0), ac = (act[k] || []).slice(0, mi + 1).reduce((s, v) => s + v, 0);
      if (b > 0 && ac > b + 0.5) over.push({ name: a.name, by: r2(ac - b) });
    });
  }
  const co = S.get(SK.CO, {}) || {};
  let gst = [];
  if (co.gstin) {
    const dn = /* @__PURE__ */ new Date();
    const nxt = (day) => {
      let d = new Date(dn.getFullYear(), dn.getMonth(), day);
      if (_iso(d) < td2) d = new Date(dn.getFullYear(), dn.getMonth() + 1, day);
      return _iso(d);
    };
    gst = [["GSTR-1", nxt(11)], ["GSTR-3B", nxt(20)]].map(([name, date]) => ({ name, date, days: daysBetween(td2, date) }));
  }
  const alerts = [];
  if (arOver.length) alerts.push({ tone: "red", t: `${arOver.length} overdue invoice${arOver.length > 1 ? "s" : ""}`, s: `${fmt(sum(arOver))} to collect`, p: "aging" });
  if (apOver.length) alerts.push({ tone: "red", t: `${apOver.length} overdue bill${apOver.length > 1 ? "s" : ""}`, s: `${fmt(sum(apOver))} to pay`, p: "aging" });
  if (over.length) alerts.push({ tone: "red", t: `${over.length} budget head${over.length > 1 ? "s" : ""} overspent`, s: over.slice(0, 2).map((o) => o.name).join(", ") + (over.length > 2 ? "\u2026" : ""), p: "budget" });
  gst.filter((g) => g.days <= 7).forEach((g) => alerts.push({ tone: g.days <= 3 ? "red" : "amber", t: `${g.name} due ${g.days === 0 ? "today" : "in " + g.days + " day" + (g.days > 1 ? "s" : "")}`, s: `${fmtDate(g.date)} \xB7 monthly filers`, p: "history" }));
  if (arSoon.length) alerts.push({ tone: "amber", t: `${arSoon.length} invoice${arSoon.length > 1 ? "s" : ""} due this week`, s: `${fmt(sum(arSoon))} expected`, p: "aging" });
  if (apSoon.length) alerts.push({ tone: "amber", t: `${apSoon.length} bill${apSoon.length > 1 ? "s" : ""} due this week`, s: `${fmt(sum(apSoon))} to pay`, p: "aging" });
  if (unrec) alerts.push({ tone: "amber", t: `${unrec} bank line${unrec > 1 ? "s" : ""} to reconcile`, s: "Match them to invoices, bills or ledgers", p: "bankrecon" });
  if (rj) alerts.push({ tone: "blue", t: `${rj} recurring entr${rj > 1 ? "ies" : "y"} waiting to post`, s: "Open Recurring Journals to post them", p: "recjournal" });
  if (adv.length) alerts.push({ tone: "blue", t: `${adv.length} unapplied advance${adv.length > 1 ? "s" : ""}`, s: `${fmt(adv.reduce((s, r) => s + r.balance, 0))} can be set off`, p: "advances" });
  if (cn.length) alerts.push({ tone: "blue", t: `${cn.length} credit note${cn.length > 1 ? "s" : ""} not settled`, s: `${fmt(cn.reduce((s, c) => s + c.out, 0))} open`, p: "advances" });
  return { cash, recv: sum(ar), pay: sum(ap), recvOver: sum(arOver), payOver: sum(apOver), alerts };
};
const useHeaderPulse = (page) => {
  const [d, setD] = useState(null);
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        setD(computePulse());
      } catch (e) {
        console.warn("Header pulse skipped:", e.message);
      }
    }, 80);
    return () => clearTimeout(id);
  }, [page]);
  useEffect(() => {
    const t = setInterval(() => {
      try {
        setD(computePulse());
      } catch (e) {
      }
    }, 9e4);
    return () => clearInterval(t);
  }, []);
  return d;
};
const BellSvg = ({ s = 16 }) => /* @__PURE__ */ React.createElement("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" }), /* @__PURE__ */ React.createElement("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" }));
const TopInsights = ({ page, go, role }) => {
  const d = useHeaderPulse(page);
  const [hide, setHide] = useState(() => {
    try {
      return localStorage.getItem("ab_hide_nums") === "1";
    } catch (e) {
      return false;
    }
  });
  const [pOpen, setPOpen] = useState(false), [aOpen, setAOpen] = useState(false);
  const pRef = useRef(null), aRef = useRef(null);
  useClickAway(pRef, () => setPOpen(false));
  useClickAway(aRef, () => setAOpen(false));
  const toggleHide = () => {
    setHide((h) => {
      const n = !h;
      try {
        localStorage.setItem("ab_hide_nums", n ? "1" : "0");
      } catch (e) {
      }
      return n;
    });
  };
  const mask = (v) => hide ? "\u20B9 \u2022\u2022\u2022\u2022\u2022\u2022" : fmtShort(v);
  const full = (v) => hide ? "\u20B9 \u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : fmt(v);
  const _ACCP = ["cashflow", "budget", "fixedassets", "recjournal", "advances", "fxpage", "coa", "journal", "ledger", "trialbalance"];
  const alerts = d ? d.alerts.filter((a) => canSee(role, _ACCP.includes(a.p) ? "reports" : a.p)) : [];
  const urgent = d ? alerts.filter((a) => a.tone !== "blue").length : 0;
  const tones = { red: "#F1495C", amber: "#E69A12", blue: "#4F6FE8" };
  const net = d ? d.cash + d.recv - d.pay : 0;
  const Row = ({ label, val, sub, color, p }) => /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-item", onClick: () => {
    setPOpen(false);
    go(p);
  } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-t" }, label), sub && /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-s" }, sub)), /* @__PURE__ */ React.createElement("b", { style: { fontSize: 13, color: color || "var(--text)" } }, val));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-wrap", ref: aRef }, /* @__PURE__ */ React.createElement("div", { className: "tb2-alerts" + (urgent ? " has" : "") + (aOpen ? " open" : ""), onClick: () => {
    setAOpen((o) => !o);
    setPOpen(false);
  }, title: "Action center \u2014 things that need your attention" }, /* @__PURE__ */ React.createElement(BellSvg, { s: 15 }), /* @__PURE__ */ React.createElement("span", { className: "tb2-hide-md" }, "Alerts"), urgent > 0 && /* @__PURE__ */ React.createElement("span", { className: "tb2-badge" }, urgent > 99 ? "99+" : urgent)), aOpen && /* @__PURE__ */ React.createElement("div", { className: "tb2-menu", style: { right: 0, minWidth: 330, maxHeight: "70vh", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-head" }, "Action center"), !d ? /* @__PURE__ */ React.createElement("div", { style: { padding: 14, fontSize: 12, color: "var(--text3)" } }, "Checking your books\u2026") : alerts.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 14px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22 } }, "\u2705"), /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-t", style: { marginTop: 4 } }, "You\u2019re all caught up"), /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-s" }, "No overdue items, nothing waiting to reconcile.")) : alerts.map((a, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "tb2-menu-item", onClick: () => {
    setAOpen(false);
    go(a.p);
  } }, /* @__PURE__ */ React.createElement("span", { className: "tb2-al-dot", style: { background: tones[a.tone] } }), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-t" }, a.t), /* @__PURE__ */ React.createElement("div", { className: "tb2-menu-s" }, a.s)), /* @__PURE__ */ React.createElement(Ic, { n: "chevron", s: 11 }))))));
};
const TopPalette = ({ user, canSee: canSee2, go, newInvoice: newInvoice2, openInvoice, searchFor }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inp = useRef(null);
  useEffect(() => {
    const h = () => {
      setOpen(true);
      setQ("");
      setIdx(0);
    };
    window.addEventListener("ab-palette", h);
    return () => window.removeEventListener("ab-palette", h);
  }, []);
  useEffect(() => {
    if (open) setTimeout(() => inp.current && inp.current.focus(), 30);
  }, [open]);
  const ACC = ["cashflow", "budget", "fixedassets", "recjournal", "advances", "fxpage", "coa", "journal", "ledger", "trialbalance"];
  const allowed = (k) => k === "admin" ? user.role === "admin" || user.role === "superadmin" : ACC.includes(k) ? canSee2(user.role, "reports") : canSee2(user.role, k);
  const needle = q.trim().toLowerCase();
  const items = useMemo(() => {
    if (!open) return [];
    const out = [];
    const acts = [["New sales invoice", "Action", () => newInvoice2()], ["New purchase bill", "Action", () => go("expenses")], ["New journal voucher", "Action", () => go("journal")], ["Reconcile bank", "Action", () => go("bankrecon")]];
    acts.forEach(([t, g, fn]) => {
      if (!needle || t.toLowerCase().includes(needle)) out.push({ t, g, fn });
    });
    Object.keys(PAGE_TITLES).filter(allowed).forEach((k) => {
      const t = PAGE_TITLES[k];
      if (!needle || t.toLowerCase().includes(needle) || (PAGE_SECTIONS[k] || "").toLowerCase().includes(needle)) out.push({ t, g: "Go to \xB7 " + (PAGE_SECTIONS[k] || "App"), fn: () => go(k) });
    });
    if (needle.length >= 2) {
      (S.get(SK.INV, []) || []).filter((i) => {
        var _a;
        return `${i.invNo} ${((_a = i.billTo) == null ? void 0 : _a.name) || ""}`.toLowerCase().includes(needle);
      }).slice(0, 6).forEach((i) => {
        var _a;
        return out.push({ t: `${i.invNo} \u2014 ${((_a = i.billTo) == null ? void 0 : _a.name) || ""}`, g: "Invoice \xB7 " + fmt(Math.abs(getGrand(i))), fn: () => openInvoice(i) });
      });
      (S.get(SK.CUST, []) || []).filter((c) => (c.name || "").toLowerCase().includes(needle)).slice(0, 4).forEach((c) => out.push({ t: c.name, g: "Customer", fn: () => searchFor("customers", c.name) }));
    }
    return out.slice(0, 14);
  }, [open, needle]);
  useEffect(() => {
    setIdx(0);
  }, [needle]);
  if (!open) return null;
  const run = (it) => {
    setOpen(false);
    it && it.fn();
  };
  const onKey = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(items[idx]);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "tb2-pal-back", onMouseDown: (e) => {
    if (e.target === e.currentTarget) setOpen(false);
  } }, /* @__PURE__ */ React.createElement("div", { className: "tb2-pal" }, /* @__PURE__ */ React.createElement("div", { className: "tb2-pal-in" }, /* @__PURE__ */ React.createElement(Ic, { n: "search", s: 16 }), /* @__PURE__ */ React.createElement("input", { ref: inp, value: q, onChange: (e) => setQ(e.target.value), onKeyDown: onKey, placeholder: "Jump to a page, start an action, or find an invoice / customer\u2026" }), /* @__PURE__ */ React.createElement("kbd", null, "Esc")), /* @__PURE__ */ React.createElement("div", { className: "tb2-pal-list" }, items.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: 22, textAlign: "center", color: "var(--text3)", fontSize: 12.5 } }, "Nothing matches \u201C", q, "\u201D."), items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "tb2-pal-item" + (i === idx ? " on" : ""), onMouseEnter: () => setIdx(i), onClick: () => run(it) }, /* @__PURE__ */ React.createElement("span", { className: "tb2-pal-t" }, it.t), /* @__PURE__ */ React.createElement("span", { className: "tb2-pal-g" }, it.g)))), /* @__PURE__ */ React.createElement("div", { className: "tb2-pal-foot" }, /* @__PURE__ */ React.createElement("span", null, "\u2191\u2193 navigate"), /* @__PURE__ */ React.createElement("span", null, "Enter open"), /* @__PURE__ */ React.createElement("span", null, "Esc close"), /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto" } }, "Tip: type 2+ letters of a customer or invoice no."))));
};
const NavGroup = ({ icon, label, page, childKeys, children }) => {
  const anyActive = childKeys.some((k) => k === page);
  const [open, setOpen] = useState(anyActive);
  useEffect(() => {
    if (anyActive) setOpen(true);
  }, [anyActive]);
  return /* @__PURE__ */ React.createElement("div", { className: "nav-group" }, /* @__PURE__ */ React.createElement("div", { className: `nav-item nav-group-toggle${anyActive ? " active" : ""}`, onClick: () => setOpen((o) => !o) }, /* @__PURE__ */ React.createElement("span", { className: "nav-icon" }, icon), /* @__PURE__ */ React.createElement("span", { className: "nav-label" }, label), /* @__PURE__ */ React.createElement("span", { className: "nav-chevron", style: { marginLeft: "auto", transform: open ? "rotate(90deg)" : "rotate(0deg)" } }, /* @__PURE__ */ React.createElement(Ic, { n: "chevron", s: 12 }))), open && /* @__PURE__ */ React.createElement("div", { className: "nav-subitems" }, children));
};
const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState("invoice");
  const [invView, setInvView] = useState("summary");
  const [agingView, setAgingView] = useState("ar");
  const [loadedInv, setLoadedInv] = useState(null);
  const [loadedPO, setLoadedPO] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [poKey, setPoKey] = useState(0);
  const [appReady, setAppReady] = useState(false);
  const [loadMsg, setLoadMsg] = useState("Connecting to cloud...");
  const [cloudError, setCloudError] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobSidebarOpen, setMobSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const bootLoad = async () => {
    setLoadMsg("Loading your data from cloud...");
    await window.FBReady;
    const { L: _L, auth: _auth } = getFB();
    const fu = await fbWaitUser();
    if (!fu || REQUIRE_2FA && _L.multiFactor(fu).enrolledFactors.length === 0) {
      setAppReady(true);
      return;
    }
    const ok = await loadCache();
    if (ok) {
      try {
        migrateInventory();
      } catch (err) {
        console.warn("Inventory migration skipped:", err.message);
      }
      try {
        ensureDefaultExpenseHeads();
      } catch (err) {
        console.warn("Expense head seeding skipped:", err.message);
      }
      try {
        ensureVoucherNumbers();
      } catch (err) {
        console.warn("Voucher number backfill skipped:", err.message);
      }
      try {
        ensureTxnRefNumbers();
      } catch (err) {
        console.warn("Transaction reference number backfill skipped:", err.message);
      }
      try {
        const n = runRecurringJournals({ email: fu.email });
        if (n) setTimeout(() => toast.info(n + " recurring journal voucher" + (n === 1 ? "" : "s") + " posted automatically"), 1500);
      } catch (err) {
        console.warn("Recurring journals skipped:", err.message);
      }
      setLoadMsg("Almost ready...");
      seedUsers();
      const _p = (S.get(SK.USERS, []) || []).find((u) => u.email && u.email.toLowerCase() === (fu.email || "").toLowerCase());
      if (!_p) {
        toast.error("No access profile for this account. Contact admin.");
        await _L.signOut(_auth);
      } else if (!_p.active) {
        toast.error("Account is deactivated. Contact admin.");
        await _L.signOut(_auth);
      } else {
        logAudit("USER_LOGIN", "Login from browser", _p);
        setUser(_p);
      }
      const savedTheme = S.get(SK.THEME, "dark");
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      setCloudError(false);
      setCacheVersion((v) => v + 1);
    } else {
      setCloudError(true);
    }
    setAppReady(true);
  };
  useEffect(() => {
    bootLoad();
  }, []);
  useEffect(() => {
    if (!cloudError) return;
    const t = setInterval(() => {
      bootLoad();
    }, 12e3);
    return () => clearInterval(t);
  }, [cloudError]);
  useEffect(() => {
    if (appReady) {
      document.documentElement.setAttribute("data-theme", theme);
      S.set(SK.THEME, theme);
    }
  }, [theme]);
  const navGuard = useRef(false);
  useEffect(() => {
    history.replaceState({ page, modal: null }, "");
    const onPop = (e) => {
      navGuard.current = true;
      const st = e.state || { page: "invoice", modal: null };
      setModal(st.modal || null);
      setPage(st.page || "invoice");
      setMobSidebarOpen(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (!appReady || !user) return;
    if (navGuard.current) {
      navGuard.current = false;
      return;
    }
    history.pushState({ page, modal }, "");
  }, [page, modal, appReady, user]);
  const login = (u) => {
    setUser(u);
    toast.success(`Welcome, ${u.name}!`);
    setTimeout(() => checkOverdue(), 1e3);
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const OVERLAY_ONLY = ["po"];
  const openModal = (m) => {
    if (OVERLAY_ONLY.includes(m)) {
      setModal(m);
    } else {
      setPage(m);
      setModal(null);
    }
    setMenuOpen(false);
  };
  const logout = () => {
    logAudit("USER_LOGOUT", "Logged out", user);
    try {
      getFB().L.signOut(getFB().auth);
    } catch (e) {
    }
    setUser(null);
    toast.info("Logged out");
  };
  const loadInv = (inv) => {
    setLoadedInv(inv);
    setFormKey((k) => k + 1);
    setPage("invoice");
    setSearchQuery("");
  };
  const loadPO = (po) => {
    setLoadedPO(po);
    setPoKey((k) => k + 1);
    setModal("po");
  };
  const newPOModal = () => {
    setLoadedPO(null);
    setPoKey((k) => k + 1);
    setModal("po");
  };
  if (!appReady) return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#080B0F", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, marginBottom: 4 } }, /* @__PURE__ */ React.createElement(LogoIcon, { size: 52 }), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "Sora,sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: -0.5, background: "linear-gradient(135deg,#4F6FE8,#F1495C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } }, "Arctic Books")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#8B949E", letterSpacing: 1 } }, loadMsg), /* @__PURE__ */ React.createElement("div", { style: { width: 48, height: 48, border: "4px solid #21262D", borderTop: "4px solid #4F6FE8", borderRadius: "50%", animation: "spin 1s linear infinite" } }), /* @__PURE__ */ React.createElement("style", null, `@keyframes spin{to{transform:rotate(360deg)}}`), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#484F58", marginTop: 8 } }, "Powered by Firebase Cloud "));
  const CloudErrorBanner = () => !cloudError ? null : /* @__PURE__ */ React.createElement("div", { style: { background: "#DC2626", color: "#fff", padding: "8px 16px", fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", position: "sticky", top: 0, zIndex: 9999 } }, /* @__PURE__ */ React.createElement("span", null, "\u26A0 Not connected to the cloud database right now \u2014 you're viewing a local cached copy. ", /* @__PURE__ */ React.createElement("b", null, "Nothing will be saved"), " until this reconnects, so please don't make changes yet."), /* @__PURE__ */ React.createElement("button", { onClick: bootLoad, style: { background: "#fff", color: "#DC2626", border: "none", borderRadius: 6, padding: "3px 10px", fontWeight: 700, cursor: "pointer", fontSize: 12 } }, "Retry Now"));
  if (!user) return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(CloudErrorBanner, null), /* @__PURE__ */ React.createElement(Login, { onAuthed: bootLoad }), /* @__PURE__ */ React.createElement(Toast, null));
  const invCount = S.get(SK.INV, []).length;
  const overdueCount = S.get(SK.INV, []).filter((i) => i.status === "Overdue").length;
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const _ACC_PAGES = ["cashflow", "budget", "fixedassets", "recjournal", "advances", "fxpage", "coa", "journal", "ledger", "trialbalance"];
  const _pageKey = _ACC_PAGES.includes(page) ? "reports" : page === "hsn" ? "company" : page;
  const pageOk = page === "admin" ? isAdmin : canSee(user.role, _pageKey);
  const pg = pageOk ? page : "dashboard";
  const NavItem = ({ icon, label, badge, badgeCls, onClick, active, extraCls }) => /* @__PURE__ */ React.createElement("div", { className: `nav-item${active ? " active" : ""}${extraCls ? " " + extraCls : ""}`, onClick: () => {
    onClick();
    setMobSidebarOpen(false);
    setSearchQuery("");
  } }, /* @__PURE__ */ React.createElement("span", { className: "nav-icon" }, icon), /* @__PURE__ */ React.createElement("span", { className: "nav-label" }, label), badge && /* @__PURE__ */ React.createElement("span", { className: `nav-badge${badgeCls ? " " + badgeCls : ""}` }, badge));
  const poCount = S.get(SK.PO, []).length;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(CloudErrorBanner, null), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", minHeight: "100vh" } }, /* @__PURE__ */ React.createElement(Toast, null), mobSidebarOpen && /* @__PURE__ */ React.createElement("div", { className: "sidebar-overlay", onClick: () => setMobSidebarOpen(false) }), /* @__PURE__ */ React.createElement("nav", { className: `sidebar${sidebarCollapsed ? " collapsed" : ""}${mobSidebarOpen ? " mob-open" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "sidebar-logo", onClick: () => setSidebarCollapsed((c) => !c) }, /* @__PURE__ */ React.createElement(LogoIcon, { size: 30 }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sidebar-brand", style: { background: "linear-gradient(135deg,#4F6FE8,#F1495C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } }, "Arctic Books"), /* @__PURE__ */ React.createElement("div", { className: "sidebar-sub" }, "Complete Accounting Software"))), /* @__PURE__ */ React.createElement("div", { className: "sidebar-nav" }, /* @__PURE__ */ React.createElement("div", { className: "sidebar-section-label" }, "Main"), /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "chart", s: 17 }),
      label: "Dashboard",
      onClick: () => {
        setPage("dashboard");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "dashboard",
      badge: overdueCount > 0 ? overdueCount : null,
      badgeCls: "red"
    }
  ), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "plus", s: 17 }), label: "New Invoice", onClick: () => {
    setPage("invoice");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "invoice" && !modal }), /* @__PURE__ */ React.createElement("div", { className: "nav-sep" }), /* @__PURE__ */ React.createElement("div", { className: "sidebar-section-label" }, "Records"), /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "history", s: 17 }),
      label: "Invoice History",
      onClick: () => {
        setPage("history");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "history" && !modal,
      badge: invCount > 0 ? invCount : null
    }
  ), canSee(user.role, "pohistory") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "cart", s: 17 }),
      label: "Purchase Orders",
      onClick: () => {
        setPage("pohistory");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "pohistory" && !modal,
      badge: poCount > 0 ? poCount : null,
      badgeCls: "gold"
    }
  ), canSee(user.role, "expenses") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "receipt", s: 17 }),
      label: "Purchases",
      onClick: () => {
        setPage("expenses");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "expenses" && !modal
    }
  ), canSee(user.role, "inventory") && /* @__PURE__ */ React.createElement(NavGroup, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "package", s: 17 }), label: "Inventory", page, childKeys: ["inventory"] }, /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "package", s: 14 }), label: "Stock Summary", onClick: () => {
    setPage("inventory");
    setInvView("summary");
    setModal(null);
  }, active: page === "inventory" && invView === "summary" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "clock", s: 14 }), label: "Inventory Ageing", onClick: () => {
    setPage("inventory");
    setInvView("ageing");
    setModal(null);
  }, active: page === "inventory" && invView === "ageing" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "chart", s: 14 }), label: "Product-wise Movement", onClick: () => {
    setPage("inventory");
    setInvView("product");
    setModal(null);
  }, active: page === "inventory" && invView === "product" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "cart", s: 14 }), label: "Bill-wise (Purchases)", onClick: () => {
    setPage("inventory");
    setInvView("purchdoc");
    setModal(null);
  }, active: page === "inventory" && invView === "purchdoc" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "receipt", s: 14 }), label: "Invoice-wise (Sales)", onClick: () => {
    setPage("inventory");
    setInvView("salesdoc");
    setModal(null);
  }, active: page === "inventory" && invView === "salesdoc" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "file", s: 14 }), label: "All Documents In / Out", onClick: () => {
    setPage("inventory");
    setInvView("alldoc");
    setModal(null);
  }, active: page === "inventory" && invView === "alldoc" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "dollar", s: 14 }), label: "Valuation & Slow Moving", onClick: () => {
    setPage("inventory");
    setInvView("valuation");
    setModal(null);
  }, active: page === "inventory" && invView === "valuation" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "list", s: 14 }), label: "Full Stock Ledger", onClick: () => {
    setPage("inventory");
    setInvView("log");
    setModal(null);
  }, active: page === "inventory" && invView === "log" })), canSee(user.role, "aging") && /* @__PURE__ */ React.createElement(NavGroup, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "clock", s: 17 }), label: "Ageing & Outstanding", page, childKeys: ["aging"] }, /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "chart", s: 14 }), label: "Summary", onClick: () => {
    setPage("aging");
    setAgingView("summary");
    setModal(null);
  }, active: page === "aging" && agingView === "summary" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "users", s: 14 }), label: "Trade Receivables", onClick: () => {
    setPage("aging");
    setAgingView("ar");
    setModal(null);
  }, active: page === "aging" && agingView === "ar" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "receipt", s: 14 }), label: "Receivables \u2014 Bill-wise", onClick: () => {
    setPage("aging");
    setAgingView("arbill");
    setModal(null);
  }, active: page === "aging" && agingView === "arbill" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "cart", s: 14 }), label: "Trade Payables", onClick: () => {
    setPage("aging");
    setAgingView("ap");
    setModal(null);
  }, active: page === "aging" && agingView === "ap" }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "file", s: 14 }), label: "Payables \u2014 Bill-wise", onClick: () => {
    setPage("aging");
    setAgingView("apbill");
    setModal(null);
  }, active: page === "aging" && agingView === "apbill" })), canSee(user.role, "bankrecon") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "bank", s: 17 }),
      label: "Bank Reconciliation",
      onClick: () => {
        setPage("bankrecon");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "bankrecon" && !modal
    }
  ), canSee(user.role, "salesview") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "dollar", s: 17 }),
      label: "Sales",
      onClick: () => {
        setPage("salesview");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "salesview" && !modal
    }
  ), canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(NavGroup, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "chart", s: 17 }), label: "Accounting", page, childKeys: ["reports", "coa", "journal", "ledger", "trialbalance", "cashflow", "budget", "fixedassets", "recjournal", "advances", "fxpage"] }, /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "chart", s: 14 }), label: "Financial Statements", onClick: () => {
    setPage("reports");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "reports" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "list", s: 14 }), label: "Chart of Accounts", onClick: () => {
    setPage("coa");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "coa" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "file", s: 14 }), label: "Journal Vouchers", onClick: () => {
    setPage("journal");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "journal" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "history", s: 14 }), label: "General Ledger", onClick: () => {
    setPage("ledger");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "ledger" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "dollar", s: 14 }), label: "Trial Balance", onClick: () => {
    setPage("trialbalance");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "trialbalance" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "chart", s: 14 }), label: "Cash Flow & Ratios", onClick: () => {
    setPage("cashflow");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "cashflow" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "list", s: 14 }), label: "Budget vs Actual", onClick: () => {
    setPage("budget");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "budget" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "dollar", s: 14 }), label: "Fixed Assets", onClick: () => {
    setPage("fixedassets");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "fixedassets" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "history", s: 14 }), label: "Recurring Journals", onClick: () => {
    setPage("recjournal");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "recjournal" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "file", s: 14 }), label: "Advance Application", onClick: () => {
    setPage("advances");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "advances" && !modal }), /* @__PURE__ */ React.createElement(NavItem, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "dollar", s: 14 }), label: "Multi-Currency (FX)", onClick: () => {
    setPage("fxpage");
    setModal(null);
    setMobSidebarOpen(false);
  }, active: page === "fxpage" && !modal })), (canSee(user.role, "quotations") || canSee(user.role, "dc") || canSee(user.role, "recurring") || canSee(user.role, "reminders")) && /* @__PURE__ */ React.createElement(NavGroup, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "file", s: 17 }), label: "Sales Tools", page, childKeys: ["quotations", "dc", "recurring", "reminders"] }, canSee(user.role, "quotations") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "file", s: 16 }),
      label: "Quotations / Estimates",
      onClick: () => {
        setPage("quotations");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "quotations" && !modal
    }
  ), canSee(user.role, "dc") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "package", s: 16 }),
      label: "Delivery Challans",
      onClick: () => {
        setPage("dc");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "dc" && !modal
    }
  ), canSee(user.role, "recurring") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "refresh", s: 16 }),
      label: "Recurring Invoices",
      onClick: () => {
        setPage("recurring");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "recurring" && !modal
    }
  ), canSee(user.role, "reminders") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "alert", s: 16 }),
      label: "Payment Reminders",
      onClick: () => {
        setPage("reminders");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "reminders" && !modal
    }
  )), (canSee(user.role, "customers") || canSee(user.role, "inventory") || canSee(user.role, "company") || canSee(user.role, "terms")) && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "nav-sep" }), /* @__PURE__ */ React.createElement(NavGroup, { icon: /* @__PURE__ */ React.createElement(Ic, { n: "settings", s: 17 }), label: "Settings", page, childKeys: ["customers", "company", "hsn", "terms"] }, canSee(user.role, "customers") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "users", s: 14 }),
      label: "Customers",
      onClick: () => {
        setPage("customers");
        setModal(null);
      },
      active: page === "customers" && !modal
    }
  ), canSee(user.role, "inventory") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "tag", s: 14 }),
      label: "Product Master",
      onClick: () => {
        setModal("products");
      },
      active: modal === "products"
    }
  ), canSee(user.role, "company") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "building", s: 14 }),
      label: "Company",
      onClick: () => {
        setPage("company");
        setModal(null);
      },
      active: page === "company"
    }
  ), canSee(user.role, "company") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "tag", s: 14 }),
      label: "HSN / SAC",
      onClick: () => {
        setPage("hsn");
        setModal(null);
      },
      active: page === "hsn"
    }
  ), canSee(user.role, "terms") && /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "file", s: 14 }),
      label: "Terms & Conditions",
      onClick: () => {
        setPage("terms");
        setModal(null);
      },
      active: page === "terms"
    }
  ))), isAdmin && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "nav-sep" }), /* @__PURE__ */ React.createElement("div", { className: "sidebar-section-label" }, "Administration"), /* @__PURE__ */ React.createElement(
    NavItem,
    {
      icon: /* @__PURE__ */ React.createElement(Ic, { n: "shield", s: 17 }),
      label: isSuperAdmin(user.email) ? "Super Admin" : "Admin Panel",
      extraCls: "nav-item-admin",
      onClick: () => {
        setPage("admin");
        setModal(null);
        setMobSidebarOpen(false);
      },
      active: page === "admin"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "sidebar-bottom" }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "8px 6px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 8,
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "var(--accent-grad)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    color: "white",
    flexShrink: 0
  } }, user.name[0]), /* @__PURE__ */ React.createElement("div", { className: "nav-label", style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, user.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, user.role))), /* @__PURE__ */ React.createElement("div", { className: "nav-item", onClick: logout, style: { color: "rgba(255,100,100,0.8)" } }, /* @__PURE__ */ React.createElement("span", { className: "nav-icon" }, /* @__PURE__ */ React.createElement(Ic, { n: "logout", s: 16 })), /* @__PURE__ */ React.createElement("span", { className: "nav-label" }, "Logout")))), /* @__PURE__ */ React.createElement("div", { className: `main-wrapper${sidebarCollapsed ? " sidebar-collapsed" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "topbar" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setMobSidebarOpen((o) => !o),
      className: "mob-hamburger",
      style: {
        background: "var(--card2)",
        border: "1px solid var(--border)",
        borderRadius: 9,
        width: 38,
        height: 38,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4.5,
        cursor: "pointer",
        flexShrink: 0,
        display: "none",
        marginLeft: 14
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { width: 16, height: 2, borderRadius: 2, background: "var(--text2)" } }),
    /* @__PURE__ */ React.createElement("div", { style: { width: 16, height: 2, borderRadius: 2, background: "var(--text2)" } }),
    /* @__PURE__ */ React.createElement("div", { style: { width: 11, height: 2, borderRadius: 2, background: "var(--text2)" } })
  ), /* @__PURE__ */ React.createElement("div", { className: "tb2-company", title: S.get(SK.CO, {}).name || "Arctic Books" }, /* @__PURE__ */ React.createElement(LogoIcon, { size: 30 }), /* @__PURE__ */ React.createElement("div", { className: "tb2-company-info" }, /* @__PURE__ */ React.createElement("div", { className: "tb2-company-name" }, S.get(SK.CO, {}).name || "Arctic Books"), /* @__PURE__ */ React.createElement("div", { className: "tb2-company-gstin" }, S.get(SK.CO, {}).gstin ? `GSTIN ${S.get(SK.CO, {}).gstin}` : "Complete Accounting Software"))), /* @__PURE__ */ React.createElement("div", { className: "tb2-page" }, /* @__PURE__ */ React.createElement("div", { className: "tb2-crumb" }, /* @__PURE__ */ React.createElement("span", null, PAGE_SECTIONS[page] || "Arctic Books"), /* @__PURE__ */ React.createElement(Ic, { n: "chevron", s: 10 }), /* @__PURE__ */ React.createElement("span", { className: "tb2-crumb-now" }, PAGE_TITLES[page] || "Arctic Books")), /* @__PURE__ */ React.createElement("div", { className: "tb2-title" }, PAGE_TITLES[page] || "Arctic Books")), /* @__PURE__ */ React.createElement("div", { className: "tb2-center" }, /* @__PURE__ */ React.createElement(TopSearch, { page, value: searchQuery, onChange: setSearchQuery, onGoSearch: () => {
    setModal(null);
    setPage("history");
  } })), /* @__PURE__ */ React.createElement("div", { className: "tb2-right" }, /* @__PURE__ */ React.createElement(
    TopQuickCreate,
    {
      user,
      canSee,
      go: (p) => {
        setModal(null);
        setSearchQuery("");
        setPage(p);
      },
      newInvoice: () => {
        setLoadedInv(null);
        setFormKey((k) => k + 1);
        setModal(null);
        setPage("invoice");
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "tb2-chip tb2-hide-md", title: "Current financial year" }, /* @__PURE__ */ React.createElement(Ic, { n: "calendar", s: 12 }), "FY ", getFY(), "-", String(getFY() + 1).slice(2)), /* @__PURE__ */ React.createElement(TopInsights, { page, role: user.role, go: (p) => {
    setModal(null);
    setSearchQuery("");
    setPage(p);
  } }), /* @__PURE__ */ React.createElement("div", { className: "tb2-divider" }), /* @__PURE__ */ React.createElement(TopUserMenu, { user, theme, setTheme, logout, goCompany: () => {
    setModal(null);
    setPage("company");
  } }))), /* @__PURE__ */ React.createElement(
    TopPalette,
    {
      user,
      canSee,
      go: (p) => {
        setModal(null);
        setSearchQuery("");
        setPage(p);
      },
      newInvoice: () => {
        setLoadedInv(null);
        setFormKey((k) => k + 1);
        setModal(null);
        setPage("invoice");
      },
      openInvoice: (inv) => {
        setModal(null);
        loadInv(inv);
      },
      searchFor: (p, q) => {
        setModal(null);
        setPage(p);
        setSearchQuery(q);
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "app-body page-enter", key: page }, pg === "invoice" && /* @__PURE__ */ React.createElement(InvoiceForm, { key: formKey, currentUser: user, initial: loadedInv, onSave: () => {
  } }), pg === "history" && /* @__PURE__ */ React.createElement(HistoryModal, { onClose: () => setPage("invoice"), onLoad: loadInv, currentUser: user, inline: true, searchQuery }), pg === "pohistory" && /* @__PURE__ */ React.createElement(POHistoryModal, { onClose: () => setPage("invoice"), onLoad: (po) => {
    setLoadedPO(po);
    setPoKey((k) => k + 1);
    setModal("po");
  }, currentUser: user, onNewPO: () => {
    setLoadedPO(null);
    setPoKey((k) => k + 1);
    setModal("po");
  }, inline: true, searchQuery }), pg === "expenses" && /* @__PURE__ */ React.createElement(PurchaseModal, { onClose: () => setPage("invoice"), currentUser: user, inline: true, searchQuery }), pg === "customers" && /* @__PURE__ */ React.createElement(CustomerModal, { onClose: () => setPage("invoice"), inline: true, searchQuery, currentUser: user }), pg === "dashboard" && /* @__PURE__ */ React.createElement(Dashboard, { onClose: () => setPage("invoice"), onLoad: loadInv, inline: true }), pg === "company" && /* @__PURE__ */ React.createElement(CompanyModal, { onClose: () => setPage("invoice"), currentUser: user, inline: true }), pg === "hsn" && /* @__PURE__ */ React.createElement(HSNModal, { onClose: () => setPage("invoice"), inline: true, searchQuery, currentUser: user }), pg === "terms" && canSee(user.role, "terms") && /* @__PURE__ */ React.createElement(TermsModal, { onClose: () => setPage("invoice"), inline: true, currentUser: user }), pg === "inventory" && canSee(user.role, "inventory") && /* @__PURE__ */ React.createElement(InventoryPage, { currentUser: user, initialTab: invView }), pg === "aging" && canSee(user.role, "aging") && /* @__PURE__ */ React.createElement(AgingReportPage, { initialTab: agingView }), pg === "bankrecon" && canSee(user.role, "bankrecon") && /* @__PURE__ */ React.createElement(BankReconPage, { currentUser: user }), pg === "salesview" && canSee(user.role, "salesview") && /* @__PURE__ */ React.createElement(SalesPage, { currentUser: user }), pg === "reports" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(ReportsPage, { currentUser: user }), pg === "coa" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(ChartOfAccountsPage, { isAdmin, currentUser: user }), pg === "journal" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(JournalVouchersPage, { currentUser: user }), pg === "ledger" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(GeneralLedgerPage, null), pg === "trialbalance" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(TrialBalancePage, null), pg === "cashflow" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(CashFlowRatiosPage, { currentUser: user }), pg === "budget" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(BudgetPage, { currentUser: user }), pg === "fixedassets" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(FixedAssetsPage, { currentUser: user }), pg === "recjournal" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(RecurringJournalsPage, { currentUser: user }), pg === "advances" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(AdvanceApplicationPage, { currentUser: user }), pg === "fxpage" && canSee(user.role, "reports") && /* @__PURE__ */ React.createElement(FxPage, { currentUser: user }), pg === "quotations" && canSee(user.role, "quotations") && /* @__PURE__ */ React.createElement(QuotationsPage, { currentUser: user }), pg === "dc" && canSee(user.role, "dc") && /* @__PURE__ */ React.createElement(DeliveryChallanPage, { currentUser: user }), pg === "recurring" && canSee(user.role, "recurring") && /* @__PURE__ */ React.createElement(RecurringInvoicesPage, { currentUser: user }), pg === "reminders" && canSee(user.role, "reminders") && /* @__PURE__ */ React.createElement(RemindersPage, { currentUser: user }), pg === "admin" && isAdmin && /* @__PURE__ */ React.createElement(AdminPanel, { currentUser: user, onClose: () => setPage("invoice"), inline: true }))), modal === "po" && /* @__PURE__ */ React.createElement("div", { className: "overlay", onClick: (e) => e.target === e.currentTarget && setModal(null) }, /* @__PURE__ */ React.createElement("div", { className: "modal", style: { maxWidth: "min(1100px, 95vw)", width: "100%" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-hdr" }, /* @__PURE__ */ React.createElement("span", { className: "modal-title" }, /* @__PURE__ */ React.createElement(Ic, { n: "cart", s: 20 }), " New Purchase Order"), /* @__PURE__ */ React.createElement("button", { className: "close-btn", onClick: () => setModal(null) }, /* @__PURE__ */ React.createElement(Ic, { n: "x" }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement(POForm, { key: poKey, currentUser: user, initial: loadedPO, onSave: () => {
    setModal(null);
    setLoadedPO(null);
  } })))), modal === "products" && /* @__PURE__ */ React.createElement(ProductMasterModal, { onClose: () => {
    setModal(null);
    setFormKey((k) => k + 1);
  }, currentUser: user })));
};
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
