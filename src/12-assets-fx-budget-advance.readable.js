const RecurringInvoicesPage = ({ inline = true, onClose, currentUser }) => {
  const [list, setList] = useState(() => S.get(SK.RECUR, []));
  const blank = () => ({ id: Date.now().toString(), name: "", customer: blankSimpleCustomer(), items: [blankSimpleItem()], frequency: "Monthly", startDate: today(), nextRunDate: today(), active: true, generatedCount: 0, lastGeneratedInvNo: "" });
  const [form, setForm] = useState(null);
  const persist = (u) => {
    setList(u);
    S.set(SK.RECUR, u);
  };
  const total = (f) => (f.items || []).reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0), 0);
  const save = () => {
    var _a;
    if (!form.name || !form.customer.name) {
      toast.error("Template name and customer are required");
      return;
    }
    const exists = list.some((r) => r.id === form.id);
    persist(exists ? list.map((r) => r.id === form.id ? form : r) : [...list, form]);
    logAudit(exists ? "RECURRING_TEMPLATE_EDITED" : "RECURRING_TEMPLATE_CREATED", `${form.name} \u2014 ${((_a = form.customer) == null ? void 0 : _a.name) || ""} \u2014 ${form.frequency}`, currentUser);
    setForm(null);
    toast.success("Recurring template saved");
  };
  const del = (id) => {
    if (!window.confirm("Delete this recurring template?")) return;
    const r = list.find((x) => x.id === id);
    persist(list.filter((r3) => r3.id !== id));
    logAudit("RECURRING_TEMPLATE_DELETED", `${(r == null ? void 0 : r.name) || ""}`, currentUser);
  };
  const generateNow = (r) => {
    const inv = convertItemsToInvoice(r.customer, r.items, `Recurring invoice \u2014 ${r.name}`, currentUser);
    if (!inv) {
      toast.error("Add at least one item first");
      return;
    }
    persist(list.map((x) => x.id === r.id ? { ...x, nextRunDate: advanceDate(x.nextRunDate, x.frequency), generatedCount: (x.generatedCount || 0) + 1, lastGeneratedInvNo: inv.invNo } : x));
    logAudit("RECURRING_INVOICE_GENERATED", `${r.name} \u2192 invoice ${inv.invNo}`, currentUser);
    toast.success(`Invoice ${inv.invNo} generated`);
  };
  return /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card" : "overlay" }, /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card-inner" : "modal" }, !inline && /* @__PURE__ */ React.createElement("div", { className: "modal-hdr" }, /* @__PURE__ */ React.createElement("span", { className: "modal-title" }, /* @__PURE__ */ React.createElement(Ic, { n: "refresh", s: 18 }), " Recurring Invoices"), /* @__PURE__ */ React.createElement("button", { className: "close-btn", onClick: onClose }, /* @__PURE__ */ React.createElement(Ic, { n: "x" }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, !form ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { marginBottom: 14 }, onClick: () => setForm(blank()) }, /* @__PURE__ */ React.createElement(Ic, { n: "plus", s: 13 }), " New Recurring Template"), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Template"), /* @__PURE__ */ React.createElement("th", null, "Customer"), /* @__PURE__ */ React.createElement("th", null, "Frequency"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Amount"), /* @__PURE__ */ React.createElement("th", null, "Next Run"), /* @__PURE__ */ React.createElement("th", null, "Generated"), /* @__PURE__ */ React.createElement("th", { style: { width: 180 } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, list.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: 24, color: "var(--text3)" } }, "No recurring templates yet.")) : list.map((r) => {
    var _a;
    const due = r.active && r.nextRunDate <= today();
    return /* @__PURE__ */ React.createElement("tr", { key: r.id, style: due ? { background: "rgba(241,73,92,0.06)" } : {} }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 600 } }, r.name, !r.active && /* @__PURE__ */ React.createElement("span", { className: "badge badge-gray", style: { marginLeft: 6 } }, "Paused")), /* @__PURE__ */ React.createElement("td", null, (_a = r.customer) == null ? void 0 : _a.name), /* @__PURE__ */ React.createElement("td", null, r.frequency), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, fmt(total(r))), /* @__PURE__ */ React.createElement("td", null, fmtDate(r.nextRunDate), " ", due && /* @__PURE__ */ React.createElement("span", { className: "badge badge-gold", style: { marginLeft: 4 } }, "Due")), /* @__PURE__ */ React.createElement("td", null, r.generatedCount || 0, r.lastGeneratedInvNo ? ` (last: ${r.lastGeneratedInvNo})` : ""), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary", onClick: () => generateNow(r) }, "Generate Now"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setForm(r) }, "Edit"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => persist(list.map((x) => x.id === r.id ? { ...x, active: !x.active } : x)) }, r.active ? "Pause" : "Resume"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => del(r.id) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 })))));
  }))))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", style: { marginBottom: 14 }, onClick: () => setForm(null) }, "\u2190 Back to list"), /* @__PURE__ */ React.createElement("div", { className: "g4", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Template Name"), /* @__PURE__ */ React.createElement("input", { className: "field-input", value: form.name, onChange: (e) => setForm((p) => ({ ...p, name: e.target.value })), placeholder: "e.g. Monthly Retainer \u2014 ABC Corp" })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Customer Name"), /* @__PURE__ */ React.createElement(SimpleCustomerPicker, { customer: form.customer, onChange: (c) => setForm((p) => ({ ...p, customer: c })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Frequency"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: form.frequency, onChange: (e) => setForm((p) => ({ ...p, frequency: e.target.value })) }, /* @__PURE__ */ React.createElement("option", null, "Weekly"), /* @__PURE__ */ React.createElement("option", null, "Monthly"), /* @__PURE__ */ React.createElement("option", null, "Quarterly"), /* @__PURE__ */ React.createElement("option", null, "Yearly"))), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Next Run Date"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: form.nextRunDate, onChange: (e) => setForm((p) => ({ ...p, nextRunDate: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "Items"), form.items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("input", { className: "field-input", style: { flex: 3 }, placeholder: "Description", value: it.desc, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { flex: 1 }, placeholder: "Qty", value: it.qty, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, qty: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { flex: 1 }, placeholder: "Rate", value: it.rate, onChange: (e) => setForm((p) => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, rate: e.target.value } : x) })) }), /* @__PURE__ */ React.createElement("div", { style: { width: 100, alignSelf: "center", textAlign: "right", fontWeight: 600 } }, fmt((parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => setForm((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) })) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 })))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary", onClick: () => setForm((p) => ({ ...p, items: [...p.items, blankSimpleItem()] })) }, /* @__PURE__ */ React.createElement(Ic, { n: "plus", s: 11 }), " Add Item"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", fontWeight: 700, fontSize: 15, margin: "12px 0" } }, "Amount per invoice: ", fmt(total(form))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: save }, "Save Template")))));
};
const RemindersPage = ({ inline = true, onClose, currentUser }) => {
  const [tick, setTick] = useState(0);
  const invs = S.get(SK.INV, []).filter((i) => ["TAX INVOICE", "NON GST INVOICE"].includes(i.docType) && i.status !== "Paid" && i.status !== "Draft" && i.status !== "Cancelled");
  const rows = useMemo(() => invs.map((i) => {
    const due = i.dueDate || i.date;
    const daysOver = Math.floor((new Date(today()) - new Date(due)) / (1e3 * 60 * 60 * 24));
    return { ...i, daysOver };
  }).sort((a, b) => b.daysOver - a.daysOver), [tick]);
  const sendWhatsApp = (inv) => {
    var _a, _b;
    const phone = (((_a = inv.billTo) == null ? void 0 : _a.phone) || "").replace(/\D/g, "");
    if (!phone) {
      toast.error("No phone number on file for this customer");
      return;
    }
    const msg = `Hi ${((_b = inv.billTo) == null ? void 0 : _b.name) || ""}, this is a friendly reminder that invoice ${inv.invNo} dated ${fmtDate(inv.date)} for ${fmt(getGrand(inv))} is ${inv.daysOver > 0 ? `overdue by ${inv.daysOver} day(s)` : "due soon"}. Please arrange payment at your earliest convenience. Thank you!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    const invs2 = S.get(SK.INV, []).map((x) => x.invNo === inv.invNo ? { ...x, lastReminderSent: (/* @__PURE__ */ new Date()).toISOString() } : x);
    S.set(SK.INV, invs2);
    logAudit("PAYMENT_REMINDER_SENT", `WhatsApp reminder sent for ${inv.invNo}`, currentUser);
    setTick((x) => x + 1);
    toast.success("Reminder opened in WhatsApp");
  };
  const sendEmail = (inv) => {
    var _a, _b;
    const email = (_a = inv.billTo) == null ? void 0 : _a.email;
    if (!email) {
      toast.error("No email on file for this customer");
      return;
    }
    const subject = `Payment Reminder \u2014 Invoice ${inv.invNo}`;
    const body = `Hi ${((_b = inv.billTo) == null ? void 0 : _b.name) || ""},

This is a reminder that invoice ${inv.invNo} dated ${fmtDate(inv.date)} for ${fmt(getGrand(inv))} is ${inv.daysOver > 0 ? `overdue by ${inv.daysOver} day(s)` : "due soon"}.

Please arrange payment at your earliest convenience.

Thank you!`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const invs2 = S.get(SK.INV, []).map((x) => x.invNo === inv.invNo ? { ...x, lastReminderSent: (/* @__PURE__ */ new Date()).toISOString() } : x);
    S.set(SK.INV, invs2);
    setTick((x) => x + 1);
  };
  return /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card" : "overlay" }, /* @__PURE__ */ React.createElement("div", { className: inline ? "inline-card-inner" : "modal" }, !inline && /* @__PURE__ */ React.createElement("div", { className: "modal-hdr" }, /* @__PURE__ */ React.createElement("span", { className: "modal-title" }, /* @__PURE__ */ React.createElement(Ic, { n: "alert", s: 18 }), " Payment Reminders"), /* @__PURE__ */ React.createElement("button", { className: "close-btn", onClick: onClose }, /* @__PURE__ */ React.createElement(Ic, { n: "x" }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text3)", marginBottom: 14 } }, "Every unpaid invoice, sorted with the most overdue first. Send a one-click WhatsApp or email nudge straight from here."), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Invoice"), /* @__PURE__ */ React.createElement("th", null, "Customer"), /* @__PURE__ */ React.createElement("th", null, "Due Date"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Amount"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", null, "Last Reminder"), /* @__PURE__ */ React.createElement("th", { style: { width: 180 } }, "Send"))), /* @__PURE__ */ React.createElement("tbody", null, rows.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: 24, color: "var(--text3)" } }, "Nothing outstanding \u2014 all caught up!")) : rows.map((i) => {
    var _a;
    return /* @__PURE__ */ React.createElement("tr", { key: i.invNo, style: i.daysOver > 0 ? { background: "rgba(255,77,106,0.05)" } : {} }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 600 } }, i.invNo), /* @__PURE__ */ React.createElement("td", null, (_a = i.billTo) == null ? void 0 : _a.name), /* @__PURE__ */ React.createElement("td", null, fmtDate(i.dueDate || i.date)), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontWeight: 600 } }, fmt(getGrand(i))), /* @__PURE__ */ React.createElement("td", null, i.daysOver > 0 ? /* @__PURE__ */ React.createElement("span", { className: "badge badge-red" }, i.daysOver, "d overdue") : /* @__PURE__ */ React.createElement("span", { className: "badge badge-gold" }, "Due soon")), /* @__PURE__ */ React.createElement("td", { style: { fontSize: 11, color: "var(--text3)" } }, i.lastReminderSent ? new Date(i.lastReminderSent).toLocaleDateString() : "Never"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary", onClick: () => sendWhatsApp(i) }, /* @__PURE__ */ React.createElement(Ic, { n: "whatsapp", s: 11 }), " WhatsApp"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => sendEmail(i) }, /* @__PURE__ */ React.createElement(Ic, { n: "mail", s: 11 }), " Email"))));
  })))))));
};
const pad2 = (n) => String(n).padStart(2, "0");
const addDaysISO = (ds, n) => {
  const d = _pd(ds);
  d.setDate(d.getDate() + n);
  return _iso(d);
};
const monthEndISO = (y, m) => `${y}-${pad2(m)}-${pad2(new Date(y, m, 0).getDate())}`;
const addMonthsISO = (ds, n, anchorDay) => {
  const d = _pd(ds);
  const day = anchorDay || d.getDate();
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  t.setDate(Math.min(day, last));
  return _iso(t);
};
const r2 = (x) => +(Number(x) || 0).toFixed(2);
const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const sameParty = (a, b) => {
  const x = String(a || "").trim().toLowerCase(), y = String(b || "").trim().toLowerCase();
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
};
const FA_PRESETS = [
  // indicative: Companies Act Sch. II useful life (SLM, years) / Income-tax WDV rate (%)
  { name: "Buildings (RCC)", life: 60, rate: 10 },
  { name: "Plant & Machinery", life: 15, rate: 15 },
  { name: "Furniture & Fixtures", life: 10, rate: 10 },
  { name: "Office Equipment", life: 5, rate: 15 },
  { name: "Computers & Laptops", life: 3, rate: 40 },
  { name: "Servers & Networking", life: 6, rate: 40 },
  { name: "Motor Vehicles", life: 8, rate: 15 },
  { name: "Electrical Installations", life: 10, rate: 10 },
  { name: "Software (Intangible)", life: 3, rate: 40 },
  { name: "Other", life: 5, rate: 15 }
];
const getAssets = () => S.get(SK.FA, []) || [];
const faSchedule = (a, asOf) => {
  asOf = asOf || today();
  const cost = parseFloat(a.cost) || 0, salvage = Math.max(0, parseFloat(a.salvage) || 0);
  const accBF = a.mode === "opening" ? parseFloat(a.accDepBF) || 0 : 0;
  const rows = [];
  let acc = accBF;
  const startStr = a.depFrom || a.purchaseDate || "";
  if (!startStr || cost <= 0) return { rows, accBF, acc, cost };
  const endStr = a.disposal && a.disposal.date ? a.disposal.date : "9999-12-31";
  const sy = +startStr.slice(0, 4), sm = +startStr.slice(5, 7), sd = +startStr.slice(8, 10) || 1;
  const maxDep = Math.max(0, cost - salvage);
  const life = parseFloat(a.lifeYears) || 0, rate = parseFloat(a.rate) || 0;
  let y = sy, m = sm;
  for (let guard = 0; guard < 1500; guard++) {
    const dim = new Date(y, m, 0).getDate();
    const mStart = `${y}-${pad2(m)}-01`, mEnd = `${y}-${pad2(m)}-${pad2(dim)}`;
    if (mStart > endStr || mStart > asOf) break;
    const first = y === sy && m === sm;
    const fromDay = first && a.mode !== "opening" ? sd : 1;
    const dispHere = endStr <= mEnd;
    const toDay = dispHere ? +endStr.slice(8, 10) : dim;
    const entryDate = dispHere ? endStr : mEnd;
    if (entryDate > asOf) break;
    const days = Math.max(0, toDay - fromDay + 1);
    const monthly = a.method === "WDV" ? (cost - acc) * rate / 1200 : life > 0 ? maxDep / (life * 12) : 0;
    let amt = monthly * days / dim;
    amt = r2(Math.min(amt, Math.max(0, maxDep - acc)));
    if (amt > 4e-3) {
      acc = r2(acc + amt);
      rows.push({ date: entryDate, ym: `${y}-${pad2(m)}`, amount: amt, accAfter: acc, wdvAfter: r2(cost - acc) });
    }
    if (dispHere) break;
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return { rows, accBF, acc, cost };
};
const faAcquiredOn = (a) => a.mode === "opening" ? OPENING_DATE : a.purchaseDate || "";
const buildFixedAssetEntries = (add) => {
  getAssets().forEach((a) => {
    const cost = parseFloat(a.cost) || 0;
    if (cost <= 0) return;
    const code = a.code || a.id;
    const tag = String(code).replace(/\s+/g, "").toUpperCase();
    if (a.mode === "opening") {
      add(OPENING_DATE, `Opening fixed asset \u2014 ${a.name}`, "FAOB", a.id, [{ account: "FIXED_ASSETS", debit: cost, credit: 0 }, { account: "CAPITAL", debit: 0, credit: cost }], "OPEN-" + tag, { docNo: code, category: "Opening Fixed Asset" });
      const bf = parseFloat(a.accDepBF) || 0;
      if (bf > 4e-3) add(OPENING_DATE, `Opening accumulated depreciation \u2014 ${a.name}`, "FAOB", a.id + "-AD", [{ account: "CAPITAL", debit: bf, credit: 0 }, { account: "ACC_DEPRECIATION", debit: 0, credit: bf }], "OPEN-" + tag + "-AD", { docNo: code, category: "Opening Fixed Asset" });
    } else if (a.mode === "new" && a.purchaseDate) {
      add(a.purchaseDate, `Asset purchase \u2014 ${a.name}`, "FAPUR", a.id, [{ account: "FIXED_ASSETS", debit: cost, credit: 0 }, { account: a.paidFromKey || "TRADE_PAYABLE", debit: 0, credit: cost }], a.voucherNo || "", { txnRefNo: a.txnRefNo || "", docNo: code, category: "Fixed Asset Purchase" });
    }
    faSchedule(a, today()).rows.forEach((r) => {
      add(
        r.date,
        `Depreciation \u2014 ${a.name} (${r.ym})`,
        "FADEP",
        a.id + "-" + r.ym,
        [{ account: "DEPRECIATION", debit: r.amount, credit: 0 }, { account: "ACC_DEPRECIATION", debit: 0, credit: r.amount }],
        "DEP-" + tag + "-" + r.ym.replace("-", ""),
        { docNo: code, category: "Depreciation" }
      );
    });
    if (a.disposal && a.disposal.date) {
      const dd = a.disposal.date, proceeds = parseFloat(a.disposal.proceeds) || 0;
      const acc = faSchedule(a, dd).acc;
      const nbv = r2(cost - acc), diff = r2(proceeds - nbv);
      const lines = [{ account: "FIXED_ASSETS", debit: 0, credit: cost }];
      if (acc > 4e-3) lines.push({ account: "ACC_DEPRECIATION", debit: acc, credit: 0 });
      if (proceeds > 4e-3) lines.push({ account: a.disposal.receivedKey || "TRADE_RECEIVABLE", debit: proceeds, credit: 0 });
      if (diff > 4e-3) lines.push({ account: "GAIN_ON_ASSET_SALE", debit: 0, credit: diff });
      else if (diff < -4e-3) lines.push({ account: "LOSS_ON_ASSET_SALE", debit: -diff, credit: 0 });
      add(dd, `Sale / disposal of asset \u2014 ${a.name}`, "FADISP", a.id, lines, a.disposal.voucherNo || "", { txnRefNo: a.disposal.txnRefNo || "", docNo: code, category: "Asset Disposal" });
    }
  });
};
const faPeriodRow = (a, from, to) => {
  const cost = parseFloat(a.cost) || 0;
  const acq = faAcquiredOn(a);
  const dis = a.disposal && a.disposal.date ? a.disposal.date : "";
  if (!acq || acq > to || cost <= 0) return null;
  if (dis && dis < from) return null;
  const dayBefore = addDaysISO(from, -1);
  const opened = acq < from;
  const grossOpen = opened ? cost : 0, additions = opened ? 0 : cost;
  const disposedIn = !!dis && dis >= from && dis <= to;
  const grossDisp = disposedIn ? cost : 0, grossClose = cost - grossDisp;
  const accOpen = opened ? faSchedule(a, dayBefore).acc : 0;
  const accTo = faSchedule(a, to).acc;
  const depYear = r2(accTo - accOpen);
  const accDisp = disposedIn ? faSchedule(a, dis).acc : 0;
  const accClose = r2(accTo - accDisp);
  const accPrevEnd = opened ? accOpen : 0;
  return {
    a,
    grossOpen,
    additions,
    grossDisp,
    grossClose,
    accOpen: r2(accOpen),
    depYear,
    accDisp: r2(accDisp),
    accClose,
    netClose: r2(grossClose - accClose),
    netOpen: r2(grossOpen - accPrevEnd),
    disposedIn
  };
};
const RJV_FREQ = [["monthly", "Monthly", 1], ["quarterly", "Quarterly", 3], ["halfyearly", "Half-yearly", 6], ["yearly", "Yearly", 12]];
const rjvStep = (t) => t.kind === "emi" || t.kind === "prepaid" ? 1 : (RJV_FREQ.find((f) => f[0] === t.frequency) || [0, 0, 1])[2];
const rjvDate = (t, k) => addMonthsISO(t.startDate, k * rjvStep(t));
const emiOf = (P, annualRate, n) => {
  P = +P || 0;
  n = +n || 0;
  const r = (+annualRate || 0) / 1200;
  if (n <= 0) return 0;
  if (r === 0) return r2(P / n);
  return r2(P * r / (1 - Math.pow(1 + r, -n)));
};
const emiSchedule = (P, annualRate, n, emiOverride) => {
  P = +P || 0;
  n = Math.round(+n || 0);
  const r = (+annualRate || 0) / 1200;
  const emi = emiOverride > 0 ? +emiOverride : emiOf(P, annualRate, n);
  const rows = [];
  let bal = P;
  for (let k = 0; k < n; k++) {
    const interest = r2(bal * r);
    let principal = r2(emi - interest);
    if (k === n - 1 || principal > bal) principal = r2(bal);
    const pay = r2(principal + interest);
    bal = r2(bal - principal);
    rows.push({ k, interest, principal, emi: pay, balance: bal });
  }
  return rows;
};
const prepaidSchedule = (total, months) => {
  total = +total || 0;
  months = Math.round(+months || 0);
  if (months <= 0) return [];
  const each = r2(total / months);
  const rows = [];
  let left = r2(total);
  for (let k = 0; k < months; k++) {
    const amt = k === months - 1 ? left : each;
    rows.push({ k, amount: amt });
    left = r2(left - amt);
  }
  return rows;
};
const rjvTotal = (t) => {
  if (t.kind === "emi") return Math.round(+t.tenure || 0);
  if (t.kind === "prepaid") return Math.round(+t.months || 0);
  if (t.count && +t.count > 0) return Math.round(+t.count);
  return t.endDate ? 600 : 600;
};
const rjvLines = (t, k) => {
  if (t.kind === "emi") {
    const row = emiSchedule(t.principal, t.rate, t.tenure, +t.emiOverride || 0)[k];
    if (!row) return null;
    const ls = [];
    if (row.principal > 4e-3) ls.push({ account: t.loanKey, desc: "Principal repaid", debit: row.principal, credit: 0 });
    if (row.interest > 4e-3) ls.push({ account: "FINANCE_COST", desc: "Interest", debit: row.interest, credit: 0 });
    ls.push({ account: t.payKey, desc: "EMI paid", debit: 0, credit: row.emi });
    return ls;
  }
  if (t.kind === "prepaid") {
    const row = prepaidSchedule(t.total, t.months)[k];
    if (!row || row.amount <= 4e-3) return null;
    return [{ account: t.expenseKey, desc: "Prepaid amortisation", debit: row.amount, credit: 0 }, { account: "PREPAID_EXP", desc: "Reducing prepaid balance", debit: 0, credit: row.amount }];
  }
  return (t.lines || []).map((l) => ({ account: l.account, desc: l.desc || "", debit: r2(l.debit), credit: r2(l.credit) })).filter((l) => l.account && (l.debit || l.credit));
};
const runRecurringJournals = (user, asOf) => {
  asOf = asOf || today();
  const tpls = S.get(SK.RJV, []) || [];
  if (!tpls.length) return 0;
  const jvs = [...getManualJournal()];
  let created = 0, changed = false;
  const next = tpls.map((t) => {
    if (!t.active) return t;
    let gen = parseInt(t.generated, 10) || 0;
    const total = rjvTotal(t);
    while (gen < total) {
      const d = rjvDate(t, gen);
      if (d > asOf || t.endDate && d > t.endDate) break;
      const lines = rjvLines(t, gen);
      if (!lines || lines.length < 2) {
        gen++;
        changed = true;
        continue;
      }
      const id = `RJV-${t.id}-${gen}`;
      if (!jvs.some((e) => e.id === id)) {
        jvs.push({
          id,
          date: d,
          narration: `${t.name} \u2014 #${gen + 1}${t.kind === "emi" || t.kind === "prepaid" || t.count && +t.count > 0 ? " of " + total : ""}`,
          referenceNo: t.refNo || "",
          reportingMethod: "both",
          lines,
          voucherNo: nextVoucherNo(),
          txnRefNo: nextTxnRefNo(d),
          srcType: "JV",
          recurringId: t.id,
          createdBy: user && (user.email || user.name) || "auto",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        created++;
      }
      gen++;
      changed = true;
    }
    return changed ? { ...t, generated: gen } : t;
  });
  if (created) S.set(SK.JOURNAL, jvs);
  if (changed) S.set(SK.RJV, next);
  return created;
};
const getAdvApps = () => S.get(SK.ADV_APPS, []) || [];
const getAdvanceRows = () => {
  const usedBy = {};
  getAdvApps().filter((a) => a.kind === "customer" || a.kind === "supplier").forEach((a) => {
    usedBy[a.advTxnId] = (usedBy[a.advTxnId] || 0) + (parseFloat(a.amt) || 0);
  });
  const invByNo = {};
  S.get(SK.INV, []).forEach((i) => {
    invByNo[i.invNo] = i;
  });
  const expById = {};
  S.get(SK.EXP, []).forEach((e) => {
    expById[e.id] = e;
  });
  const qsById = {};
  S.get(SK.QSALE, []).forEach((q) => {
    qsById[q.id] = q;
  });
  const rows = [];
  (S.get(SK.BANK, []) || []).forEach((t) => {
    var _a, _b, _c, _d;
    const amt = parseFloat(t.amount) || 0;
    if (!amt || !t.matched) return;
    const isCredit = t.type === "credit";
    const advKey = isCredit ? "CUSTOMER_ADVANCE" : "ADVANCES";
    const allocs = Array.isArray(t.allocs) ? t.allocs.filter((a) => (parseFloat(a.amt) || 0) > 4e-3) : [];
    let adv = 0, party = t.advParty || "";
    if (t.matchedType === "ledger" && t.ledgerKey === advKey) adv = amt;
    else if (allocs.length && !["creditnote", "suprefund"].includes(allocs[0].kind)) {
      const A = allocs.reduce((s, a) => s + (parseFloat(a.amt) || 0), 0);
      const d = r2(amt - A);
      const rk = t.restKey || (isCredit ? d > 0 ? "CUSTOMER_ADVANCE" : "TDS_RECEIVABLE" : d > 0 ? "ADVANCES" : "OTHER_INCOME");
      if (d > 4e-3 && rk === advKey) adv = d;
      if (!party) {
        const a0 = allocs[0];
        party = a0.kind === "invoice" ? ((_b = (_a = invByNo[a0.ref]) == null ? void 0 : _a.billTo) == null ? void 0 : _b.name) || "" : a0.kind === "quicksale" ? ((_c = qsById[a0.ref]) == null ? void 0 : _c.customer) || "" : ((_d = expById[a0.ref]) == null ? void 0 : _d.vendor) || "";
      }
    }
    if (adv <= 4e-3) return;
    const used = r2(usedBy[t.id] || 0);
    rows.push({ txnId: t.id, kind: isCredit ? "customer" : "supplier", date: t.date, party, amount: r2(adv), used, balance: r2(adv - used), ref: t.refNo || "", desc: t.desc || "", acctId: t.acctId || "PRIMARY" });
  });
  return rows.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
};
const tagAdvanceParty = (txnId, party) => S.set(SK.BANK, (S.get(SK.BANK, []) || []).map((t) => t.id === txnId ? { ...t, advParty: party } : t));
const cnSettledMap = () => {
  const m = {};
  (S.get(SK.BANK, []) || []).forEach((t) => {
    if (Array.isArray(t.allocs)) t.allocs.forEach((a) => {
      if (a.kind === "creditnote") m[a.ref] = (m[a.ref] || 0) + (parseFloat(a.amt) || 0);
    });
  });
  getAdvApps().filter((a) => a.kind === "cn").forEach((a) => {
    m[a.advTxnId] = (m[a.advTxnId] || 0) + (parseFloat(a.amt) || 0);
  });
  return m;
};
const getOpenCreditNotes = () => {
  const sm = cnSettledMap();
  return S.get(SK.INV, []).filter((i) => i.docType === "CREDIT NOTE" && i.status !== "Draft" && i.status !== "Cancelled").map((i) => {
    var _a;
    const total = Math.abs(getGrand(i));
    const settled = r2(sm[i.invNo] || 0);
    return { kind: "creditnote", ref: i.invNo, docNo: i.invNo, party: ((_a = i.billTo) == null ? void 0 : _a.name) || "Unknown customer", total, settled, out: r2(total - settled), date: i.date, due: i.date, extra: i.origInvNo ? "against " + i.origInvNo : "" };
  }).filter((o) => o.out > 0.01);
};
const creditNoteAgingRows = (asOn) => getOpenCreditNotes().map((o) => ({
  id: o.ref,
  party: o.party,
  gstin: "",
  docNo: o.ref,
  date: o.date,
  dueDate: o.date,
  gross: -o.total,
  paid: -o.settled,
  due: -o.out,
  daysOverdue: 0,
  bucket: "current",
  status: "Credit",
  docType: "CREDIT NOTE"
}));
const applyAdvance = ({ kind, advTxnId, party, docKind, docRef, docNo, amt, date, user }) => {
  amt = r2(amt);
  if (amt <= 4e-3) return null;
  const rec = {
    id: newId("AA-"),
    date: date || today(),
    kind,
    advTxnId,
    party: party || "",
    docKind,
    docRef,
    docNo: docNo || docRef,
    amt,
    voucherNo: nextVoucherNo(),
    txnRefNo: nextTxnRefNo(date || today()),
    createdBy: user && (user.email || user.name) || "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  S.set(SK.ADV_APPS, [...getAdvApps(), rec]);
  adjustDocPaid(docKind, docRef, amt, { date: rec.date, refNo: (kind === "cn" ? "CN " : "ADV ") + advTxnId });
  return rec;
};
const reverseAdvanceApp = (id) => {
  const a = getAdvApps().find((x) => x.id === id);
  if (!a) return;
  S.set(SK.ADV_APPS, getAdvApps().filter((x) => x.id !== id));
  adjustDocPaid(a.docKind, a.docRef, -a.amt, { date: a.date, refNo: "" });
};
const buildAdvanceEntries = (add) => {
  getAdvApps().forEach((a) => {
    const amt = parseFloat(a.amt) || 0;
    if (amt <= 4e-3) return;
    if (a.kind === "customer") add(a.date, `Advance adjusted \u2014 ${a.party || "customer"} against ${a.docNo}`, "ADVAPP", a.id, [{ account: "CUSTOMER_ADVANCE", debit: amt, credit: 0 }, { account: "TRADE_RECEIVABLE", debit: 0, credit: amt }], a.voucherNo, { txnRefNo: a.txnRefNo, docNo: a.docNo, category: "Advance Adjustment" });
    else if (a.kind === "supplier") add(a.date, `Advance adjusted \u2014 ${a.party || "supplier"} against ${a.docNo}`, "ADVAPP", a.id, [{ account: "TRADE_PAYABLE", debit: amt, credit: 0 }, { account: "ADVANCES", debit: 0, credit: amt }], a.voucherNo, { txnRefNo: a.txnRefNo, docNo: a.docNo, category: "Advance Adjustment" });
  });
};
const FX_CURRENCIES = [
  { code: "INR", name: "Indian Rupee", sym: "\u20B9" },
  { code: "USD", name: "US Dollar", sym: "$" },
  { code: "EUR", name: "Euro", sym: "\u20AC" },
  { code: "GBP", name: "Pound Sterling", sym: "\xA3" },
  { code: "AED", name: "UAE Dirham", sym: "AED " },
  { code: "SGD", name: "Singapore Dollar", sym: "S$" },
  { code: "AUD", name: "Australian Dollar", sym: "A$" },
  { code: "CAD", name: "Canadian Dollar", sym: "C$" },
  { code: "CHF", name: "Swiss Franc", sym: "CHF " },
  { code: "JPY", name: "Japanese Yen", sym: "\xA5" },
  { code: "SAR", name: "Saudi Riyal", sym: "SAR " },
  { code: "QAR", name: "Qatari Riyal", sym: "QAR " },
  { code: "MYR", name: "Malaysian Ringgit", sym: "RM " },
  { code: "ZAR", name: "South African Rand", sym: "R " },
  { code: "CNY", name: "Chinese Yuan", sym: "CN\xA5" },
  { code: "NZD", name: "New Zealand Dollar", sym: "NZ$" }
];
const FX_WORD = { USD: "US Dollar", EUR: "Euro", GBP: "Pound Sterling", AED: "UAE Dirham", SGD: "Singapore Dollar", AUD: "Australian Dollar", CAD: "Canadian Dollar", CHF: "Swiss Franc", JPY: "Japanese Yen", SAR: "Saudi Riyal", QAR: "Qatari Riyal", MYR: "Malaysian Ringgit", ZAR: "South African Rand", CNY: "Chinese Yuan", NZD: "New Zealand Dollar" };
const fxSym = (c) => (FX_CURRENCIES.find((x) => x.code === c) || {}).sym || (c ? c + " " : "\u20B9");
const fmtC = (n, cur) => !cur || cur === "INR" ? fmt(n) : fxSym(cur) + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const isFxInv = (inv) => !!(inv && inv.currency && inv.currency !== "INR" && inv.fc);
const amountInWordsFC = (amt, cur) => {
  const n = Math.abs(Number(amt) || 0);
  let whole = Math.floor(n + 1e-9), cents = Math.round((n - whole) * 100);
  if (cents >= 100) {
    whole += 1;
    cents = 0;
  }
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x) => x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? "-" + ones[x % 10] : "");
  const three = (x) => x >= 100 ? ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + two(x % 100) : "") : two(x);
  const parts = [[1e9, "Billion"], [1e6, "Million"], [1e3, "Thousand"]];
  let rest = whole, out = [];
  parts.forEach(([v, l]) => {
    const q = Math.floor(rest / v);
    if (q) {
      out.push(three(q) + " " + l);
      rest -= q * v;
    }
  });
  if (rest) out.push(three(rest));
  let s = (FX_WORD[cur] || cur) + " " + (out.join(" ") || "Zero");
  if (cents) s += " and " + two(cents) + " Cents";
  return s + " Only";
};
const toBaseInvoice = (inv, rate) => {
  const m = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? v : r2(n * rate);
  };
  const fc = { items: inv.items, subtotal: inv.subtotal, taxBreakdown: inv.taxBreakdown || {}, totalGST: inv.totalGST, roundOff: inv.roundOff, grand: inv.grand };
  const items = (inv.items || []).map((it) => ({ ...it, rate: m(it.rate), taxable: m(it.taxable), gstAmt: m(it.gstAmt), total: m(it.total) }));
  const tb = {};
  Object.entries(inv.taxBreakdown || {}).forEach(([k, v]) => {
    tb[k] = m(v);
  });
  const grand = r2((parseFloat(inv.grand) || 0) * rate), sub = r2((parseFloat(inv.subtotal) || 0) * rate), gst = r2((parseFloat(inv.totalGST) || 0) * rate);
  return { ...inv, items, subtotal: sub.toFixed(2), taxBreakdown: tb, totalGST: gst.toFixed(2), roundOff: inv.docType === "NON GST INVOICE" ? 0 : r2(Math.abs(grand) - (sub + gst)), grand, exchRate: rate, fc };
};
const unwrapFcInvoice = (inv) => inv && inv.fc ? { ...inv, ...inv.fc } : inv;
const fcView = (inv) => inv && inv.fc ? { ...inv, ...inv.fc, __cur: inv.currency, __rate: inv.exchRate, __inr: Math.abs(parseFloat(inv.grand) || 0) } : inv;
const getFxRates = () => S.get(SK.FXR, {}) || {};
const saveFxRate = (cur, rate, date) => {
  if (!cur || cur === "INR" || !(rate > 0)) return;
  S.set(SK.FXR, { ...getFxRates(), [cur]: { rate: +rate, date: date || today() } });
};
const getOpenFxInvoices = () => S.get(SK.INV, []).filter((i) => isFxInv(i) && ["TAX INVOICE", "NON GST INVOICE", "DEBIT NOTE"].includes(i.docType) && i.status !== "Draft" && i.status !== "Cancelled").map((i) => {
  var _a;
  const total = Math.abs(getGrand(i));
  const out = r2(total - invPaid(i));
  const rate = parseFloat(i.exchRate) || 1;
  return { inv: i, invNo: i.invNo, party: ((_a = i.billTo) == null ? void 0 : _a.name) || "", date: i.date, cur: i.currency, rate, out, fcOut: r2(out / rate), fcTotal: Math.abs(parseFloat(i.fc.grand) || 0) };
}).filter((o) => o.out > 0.01);
const isCashAcct = (a) => a.key === "BANK" || a.key === "CASH_IN_HAND" || a.parent === "BANK";
const getCashFlow = (from, to) => {
  const accts = getAllAccounts();
  const open = getTrialBalance(addDaysISO(from, -1)), close = getTrialBalance(to);
  const bal = (tb, k) => {
    const r = tb.find((x) => x.account === k);
    return r ? r.balance : 0;
  };
  const keys = [.../* @__PURE__ */ new Set([...open.map((r) => r.account), ...close.map((r) => r.account)])];
  const typeOf = (k) => accts.find((a) => a.key === k) || coaByKey(k);
  let cashOpen = 0, cashClose = 0, netProfit = 0, dep = 0;
  const wc = [], inv = [], fin = [];
  const faD = { fa: 0, ad: 0 };
  const addTo = (arr, label, amt, acct) => {
    if (Math.abs(amt) < 5e-3) return;
    const ex = arr.find((x) => x.label === label);
    const it = acct ? { account: acct, amount: r2(amt) } : null;
    if (ex) {
      ex.amount = r2(ex.amount + amt);
      if (it) ex.items.push(it);
    } else arr.push({ label, amount: r2(amt), items: it ? [it] : [] });
  };
  const npItems = [], depItems = [], cashItems = [];
  keys.forEach((k) => {
    const a = typeOf(k);
    const d = bal(close, k) - bal(open, k);
    if (isCashAcct(a)) {
      cashOpen += bal(open, k);
      cashClose += bal(close, k);
      cashItems.push({ account: k, open: r2(bal(open, k)), close: r2(bal(close, k)) });
      return;
    }
    if (a.type === "income" || a.type === "expense") {
      netProfit += -d;
      if (Math.abs(d) >= 5e-3) npItems.push({ account: k, amount: r2(-d) });
      if (a.scheduleGroup === "Depreciation and Amortisation Expense") {
        dep += d;
        if (Math.abs(d) >= 5e-3) depItems.push({ account: k, amount: r2(d) });
      }
      return;
    }
    if (a.key === "RETAINED_EARNINGS") return;
    const eff = -d;
    if (k === "FIXED_ASSETS") {
      faD.fa += d;
      return;
    }
    if (k === "ACC_DEPRECIATION") {
      faD.ad += d;
      return;
    }
    if (k === "INVESTMENTS" || a.type === "asset" && a.group === "Non-Current Assets") {
      addTo(inv, a.scheduleGroup || a.name, eff, k);
      return;
    }
    if (a.type === "equity" || /Borrowings/.test(a.scheduleGroup || "") || a.type === "liability" && a.group === "Non-Current Liabilities" && k !== "LT_PROVISION") {
      const isBorrow = a.type === "liability";
      addTo(fin, a.type === "equity" ? "Capital introduced / (withdrawn)" : isBorrow ? "Borrowings raised / (repaid)" : a.scheduleGroup || a.name, eff, k);
      return;
    }
    const lbl = a.type === "asset" ? { "Trade Receivables": "(Increase)/decrease in trade receivables", "Inventories": "(Increase)/decrease in inventories" }[a.scheduleGroup] || `(Increase)/decrease in ${(a.scheduleGroup || a.name).toLowerCase()}` : { "Trade Payables": "Increase/(decrease) in trade payables" }[a.scheduleGroup] || `Increase/(decrease) in ${(a.scheduleGroup || a.name).toLowerCase()}`;
    addTo(wc, lbl, eff, k);
  });
  const lines = getAllLedgerLines().filter((l) => (l.date || "") >= from && (l.date || "") <= to);
  const gain = r2(lines.filter((l) => l.account === "GAIN_ON_ASSET_SALE").reduce((s, l) => s + l.credit - l.debit, 0));
  const loss = r2(lines.filter((l) => l.account === "LOSS_ON_ASSET_SALE").reduce((s, l) => s + l.debit - l.credit, 0));
  const adj = [];
  addTo(adj, "Depreciation and amortisation", dep);
  addTo(adj, "(Gain) on sale of fixed assets", -gain);
  addTo(adj, "Loss on sale of fixed assets", loss);
  const setItems = (arr, label, items) => {
    const r = arr.find((x) => x.label === label);
    if (r) r.items = items.filter((i) => Math.abs(i.amount) >= 5e-3);
  };
  setItems(adj, "Depreciation and amortisation", depItems);
  setItems(adj, "(Gain) on sale of fixed assets", [{ account: "GAIN_ON_ASSET_SALE", amount: -gain }]);
  setItems(adj, "Loss on sale of fixed assets", [{ account: "LOSS_ON_ASSET_SALE", amount: loss }]);
  const faNet = -(faD.fa + faD.ad) - dep;
  const invFA = [];
  addTo(invFA, "Purchase of fixed assets (net of book value of disposals)", faNet);
  addTo(invFA, "Gain / (loss) realised on sale of fixed assets", gain - loss);
  setItems(invFA, "Purchase of fixed assets (net of book value of disposals)", [{ account: "FIXED_ASSETS", amount: r2(-faD.fa) }, { account: "ACC_DEPRECIATION", amount: r2(-faD.ad) }, ...depItems.map((i) => ({ account: i.account, amount: -i.amount }))]);
  setItems(invFA, "Gain / (loss) realised on sale of fixed assets", [{ account: "GAIN_ON_ASSET_SALE", amount: gain }, { account: "LOSS_ON_ASSET_SALE", amount: -loss }]);
  const invAll = [...invFA, ...inv];
  const sum = (a) => r2(a.reduce((s, x) => s + x.amount, 0));
  netProfit = r2(netProfit);
  const cfo = r2(netProfit + sum(adj) + sum(wc)), cfi = sum(invAll), cff = sum(fin);
  const netChange = r2(cfo + cfi + cff), actual = r2(cashClose - cashOpen);
  return { netProfitItems: npItems.filter((i) => Math.abs(i.amount) >= 5e-3), cashItems, netProfit, adj, wc, cfo, invAll, cfi, fin, cff, netChange, cashOpen: r2(cashOpen), cashClose: r2(cashClose), diff: r2(actual - netChange) };
};
const getRatios = (from, to) => {
  const accts = getAllAccounts();
  const close = getTrialBalance(to);
  const sumB = (pred, sign = 1) => close.reduce((s, r) => {
    const a = coaByKey(r.account);
    return pred(a, r) ? s + sign * r.balance : s;
  }, 0);
  const cash = sumB((a) => isCashAcct(a));
  const curAssets = sumB((a) => a.type === "asset" && a.group === "Current Assets");
  const curLiab = sumB((a) => a.type === "liability" && a.group === "Current Liabilities", -1);
  const inventory = sumB((a) => a.key === "INVENTORY"), prepaid = sumB((a) => a.key === "PREPAID_EXP");
  const recv = sumB((a) => a.key === "TRADE_RECEIVABLE"), pay = sumB((a) => a.key === "TRADE_PAYABLE", -1);
  const debt = sumB((a) => a.key === "LT_BORROWING" || a.key === "ST_BORROWING", -1);
  const totalAssets = sumB((a) => a.type === "asset"), totalLiab = sumB((a) => a.type === "liability", -1);
  const bs = getBalanceSheet(to);
  const equity = bs.totalEquity;
  const pl = getPLAccrual(from, to);
  const rows = pl.rows;
  const sumPL = (pred) => rows.filter(pred).reduce((s, r) => s + r.amount, 0);
  const revenue = sumPL((r) => r.type === "income" && coaByKey(r.account).scheduleGroup === "Revenue from Operations");
  const otherInc = sumPL((r) => r.type === "income") - revenue;
  const cogs = sumPL((r) => r.type === "expense" && coaByKey(r.account).scheduleGroup === "Cost of Materials Consumed");
  const fin = sumPL((r) => r.type === "expense" && coaByKey(r.account).scheduleGroup === "Finance Costs");
  const dep = sumPL((r) => r.type === "expense" && coaByKey(r.account).scheduleGroup === "Depreciation and Amortisation Expense");
  const np = pl.net, ebit = np + fin, ebitda = ebit + dep;
  const days = Math.max(1, daysBetween(from, to) + 1);
  const ann = 365 / days;
  const lines = getAllLedgerLines().filter((l) => (l.date || "") >= from && (l.date || "") <= to && l.reportingMethod !== "cash");
  const billedSales = lines.filter((l) => l.account === "TRADE_RECEIVABLE" && (l.srcType === "INV" || l.srcType === "QSALE")).reduce((s, l) => s + l.debit - l.credit, 0);
  const billedPurch = lines.filter((l) => l.account === "TRADE_PAYABLE" && l.srcType === "EXP").reduce((s, l) => s + l.credit - l.debit, 0);
  const div = (a, b) => b > 4e-3 || b < -4e-3 ? a / b : null;
  const dso = div(recv * days, billedSales), dpo = div(pay * days, billedPurch), dio = cogs > 4e-3 ? div(inventory * days, cogs) : null;
  const ccc = dso != null && dpo != null ? dso + (dio || 0) - dpo : null;
  const list = [
    { g: "Liquidity", k: "cr", label: "Current ratio", v: div(curAssets, curLiab), t: "x", good: (v) => v >= 1.5 ? "good" : v >= 1 ? "warn" : "bad", note: "Current assets \xF7 current liabilities. 1.5\u20132 is comfortable." },
    { g: "Liquidity", k: "qr", label: "Quick ratio", v: div(curAssets - inventory - prepaid, curLiab), t: "x", good: (v) => v >= 1 ? "good" : v >= 0.7 ? "warn" : "bad", note: "(Current assets \u2212 inventory \u2212 prepaid) \xF7 current liabilities. 1+ is healthy." },
    { g: "Liquidity", k: "cash", label: "Cash ratio", v: div(cash, curLiab), t: "x", good: (v) => v >= 0.5 ? "good" : v >= 0.2 ? "warn" : "bad", note: "Cash & bank \xF7 current liabilities." },
    { g: "Liquidity", k: "wc", label: "Working capital", v: curAssets - curLiab, t: "\u20B9", good: (v) => v >= 0 ? "good" : "bad", note: "Current assets \u2212 current liabilities." },
    { g: "Profitability", k: "gm", label: "Gross margin", v: revenue > 4e-3 ? (revenue - cogs) / revenue * 100 : null, t: "%", good: (v) => v >= 30 ? "good" : v >= 15 ? "warn" : "bad", note: "(Revenue \u2212 cost of materials) \xF7 revenue." },
    { g: "Profitability", k: "em", label: "EBITDA margin", v: revenue > 4e-3 ? ebitda / revenue * 100 : null, t: "%", good: (v) => v >= 15 ? "good" : v >= 5 ? "warn" : "bad", note: "(Net profit + finance cost + depreciation) \xF7 revenue." },
    { g: "Profitability", k: "nm", label: "Net profit margin", v: revenue > 4e-3 ? np / revenue * 100 : null, t: "%", good: (v) => v >= 10 ? "good" : v >= 3 ? "warn" : "bad", note: "Net profit \xF7 revenue from operations." },
    { g: "Profitability", k: "roe", label: "Return on equity (annualised)", v: equity > 4e-3 ? np * ann / equity * 100 : null, t: "%", good: (v) => v >= 15 ? "good" : v >= 8 ? "warn" : "bad", note: "Net profit (annualised) \xF7 closing equity." },
    { g: "Profitability", k: "roa", label: "Return on assets (annualised)", v: totalAssets > 4e-3 ? np * ann / totalAssets * 100 : null, t: "%", good: (v) => v >= 8 ? "good" : v >= 3 ? "warn" : "bad", note: "Net profit (annualised) \xF7 total assets." },
    { g: "Leverage", k: "de", label: "Debt-to-equity", v: equity > 4e-3 ? debt / equity : null, t: "x", good: (v) => v <= 1 ? "good" : v <= 2 ? "warn" : "bad", note: "Borrowings \xF7 equity. Lower is safer." },
    { g: "Leverage", k: "le", label: "Total liabilities \xF7 equity", v: equity > 4e-3 ? totalLiab / equity : null, t: "x", good: (v) => v <= 1.5 ? "good" : v <= 3 ? "warn" : "bad", note: "All liabilities \xF7 equity." },
    { g: "Leverage", k: "ic", label: "Interest coverage", v: fin > 4e-3 ? ebit / fin : null, t: "x", good: (v) => v >= 3 ? "good" : v >= 1.5 ? "warn" : "bad", note: "EBIT \xF7 finance costs." },
    { g: "Efficiency", k: "dso", label: "DSO \u2014 days sales outstanding", v: dso, t: "d", good: (v) => v <= 45 ? "good" : v <= 75 ? "warn" : "bad", note: "Receivables \xF7 credit sales billed (incl. GST) \xD7 days in period. Lower = faster collection." },
    { g: "Efficiency", k: "dpo", label: "DPO \u2014 days payables outstanding", v: dpo, t: "d", good: (v) => v >= 30 ? "good" : v >= 15 ? "warn" : "bad", note: "Payables \xF7 purchase bills received \xD7 days in period. Higher = longer to pay suppliers." },
    { g: "Efficiency", k: "dio", label: "DIO \u2014 days inventory outstanding", v: dio, t: "d", good: (v) => v <= 60 ? "good" : v <= 120 ? "warn" : "bad", note: "Inventory \xF7 cost of materials \xD7 days." },
    { g: "Efficiency", k: "ccc", label: "Cash conversion cycle", v: ccc, t: "d", good: (v) => v <= 45 ? "good" : v <= 90 ? "warn" : "bad", note: "DSO + DIO \u2212 DPO. Days your cash is tied up in operations." },
    { g: "Efficiency", k: "rt", label: "Receivables turnover", v: div(billedSales * ann, recv), t: "x", good: (v) => v >= 8 ? "good" : v >= 4 ? "warn" : "bad", note: "Credit sales (annualised) \xF7 receivables." },
    { g: "Efficiency", k: "it", label: "Inventory turnover", v: cogs > 4e-3 ? div(cogs * ann, inventory) : null, t: "x", good: (v) => v >= 6 ? "good" : v >= 3 ? "warn" : "bad", note: "Cost of materials (annualised) \xF7 inventory." },
    { g: "Efficiency", k: "at", label: "Asset turnover", v: div(revenue * ann, totalAssets), t: "x", good: (v) => v >= 1 ? "good" : v >= 0.5 ? "warn" : "bad", note: "Revenue (annualised) \xF7 total assets." }
  ];
  return { list, base: { revenue: r2(revenue), cogs: r2(cogs), np: r2(np), ebitda: r2(ebitda), cash: r2(cash), recv: r2(recv), pay: r2(pay), inventory: r2(inventory), equity: r2(equity), days } };
};
const fmtRatio = (v, t) => v == null || isNaN(v) ? "\u2014" : t === "%" ? v.toFixed(1) + "%" : t === "x" ? v.toFixed(2) + "\xD7" : t === "d" ? Math.round(v) + " days" : fmt(v);
const FY_MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const getBudgetFY = (fy) => (S.get(SK.BUDGET, {}) || {})["FY" + fy] || {};
const saveBudgetFY = (fy, rows) => S.set(SK.BUDGET, { ...S.get(SK.BUDGET, {}) || {}, ["FY" + fy]: rows });
const getMonthlyActuals = (fy) => {
  const from = fyStartOf(fy), to = fyEndOf(fy);
  const out = {};
  getAllLedgerLines().forEach((l) => {
    const d = l.date || "";
    if (d < from || d > to || l.reportingMethod === "cash") return;
    const a = coaByKey(l.account);
    if (a.type !== "income" && a.type !== "expense") return;
    const mi = (parseInt(d.slice(5, 7), 10) + 8) % 12;
    if (!out[l.account]) out[l.account] = new Array(12).fill(0);
    out[l.account][mi] += a.type === "income" ? l.credit - l.debit : l.debit - l.credit;
  });
  Object.keys(out).forEach((k) => {
    out[k] = out[k].map(r2);
  });
  return out;
};
const hasAdvanceApps = (txnId) => getAdvApps().some((a) => a.advTxnId === txnId);
const PageShell = ({ children }) => /* @__PURE__ */ React.createElement("div", { className: "inline-card" }, /* @__PURE__ */ React.createElement("div", { className: "inline-card-inner" }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, children)));
const Kpi = ({ label, value, color, sub }) => /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "12px 14px", flex: "1 1 170px", minWidth: 150 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px" } }, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, fontWeight: 800, color: color || "var(--text)", marginTop: 4, fontFamily: "Sora,sans-serif" } }, value), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", marginTop: 2 } }, sub));
const InfoNote = ({ children, tone }) => /* @__PURE__ */ React.createElement("div", { className: "alert", style: { background: tone === "warn" ? "rgba(241,73,92,0.07)" : "rgba(79,111,232,0.06)", border: `1px solid ${tone === "warn" ? "rgba(241,73,92,0.25)" : "rgba(79,111,232,0.2)"}`, borderRadius: 10, fontSize: 12, marginBottom: 14 } }, children);
const isAdminUser = (u) => (u == null ? void 0 : u.role) === "admin" || (u == null ? void 0 : u.role) === "superadmin";
const FyPicker = ({ value, onChange }) => /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Financial Year"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value, onChange: (e) => onChange(parseInt(e.target.value, 10)) }, [0, 1, 2, 3, 4, 5].map((k) => getFY() - k).map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y }, "FY ", y, "-", String(y + 1).slice(2)))));
const LedgerSelect = ({ value, onChange, extra = [], style }) => {
  const opts = [...getPaymentLedgers().map((a) => [a.key, a.name]), ...extra];
  return /* @__PURE__ */ React.createElement("select", { className: "field-input", style, value, onChange: (e) => onChange(e.target.value) }, opts.map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)));
};
const blankAsset = () => ({ id: newId("FA"), code: "", name: "", category: "Office Equipment", mode: "new", purchaseDate: today(), depFrom: "", cost: "", salvage: "", method: "SLM", lifeYears: 5, rate: 15, accDepBF: "", paidFromKey: "TRADE_PAYABLE", billId: "", location: "", serial: "", notes: "" });
const FixedAssetsPage = ({ currentUser }) => {
  const [list, setList] = useState(getAssets());
  const [tab, setTab] = useState("register");
  const [form, setForm] = useState(null);
  const [dispose, setDispose] = useState(null);
  const [selId, setSelId] = useState(null);
  const [selFY, setSelFY] = useState(getFY());
  const isAdmin = isAdminUser(currentUser);
  const from = fyStartOf(selFY), fyEnd = fyEndOf(selFY), to = fyEnd < today() ? fyEnd : today();
  const reload = () => setList(getAssets());
  const rows = useMemo(() => list.map((a) => faPeriodRow(a, from, to)).filter(Boolean), [list, selFY]);
  const tot = rows.reduce((t, r) => ({ gOpen: t.gOpen + r.grossOpen, add: t.add + r.additions, dis: t.dis + r.grossDisp, gClose: t.gClose + r.grossClose, aOpen: t.aOpen + r.accOpen, dep: t.dep + r.depYear, aDis: t.aDis + r.accDisp, aClose: t.aClose + r.accClose, net: t.net + r.netClose, netO: t.netO + r.netOpen }), { gOpen: 0, add: 0, dis: 0, gClose: 0, aOpen: 0, dep: 0, aDis: 0, aClose: 0, net: 0, netO: 0 });
  const bills = S.get(SK.EXP, []) || [];
  const startAdd = () => setForm(blankAsset());
  const preset = (name) => {
    const p = FA_PRESETS.find((x) => x.name === name);
    setForm((f) => ({ ...f, category: name, ...p ? { lifeYears: p.life, rate: p.rate } : {} }));
  };
  const pickBill = (id) => {
    const b = bills.find((x) => x.id === id);
    if (!b) {
      setForm((f) => ({ ...f, billId: "" }));
      return;
    }
    const its = expItems(b);
    const taxable = its.reduce((s, i) => s + (parseFloat(i.taxable) || 0), 0);
    setForm((f) => ({ ...f, billId: id, name: f.name || its[0] && (its[0].product || its[0].desc) || b.vendor || "", cost: r2(taxable) || f.cost, purchaseDate: b.billDate || b.date || f.purchaseDate }));
  };
  const saveAsset = () => {
    const f = form;
    if (!f.name.trim()) {
      toast.error("Asset name is required");
      return;
    }
    const cost = parseFloat(f.cost) || 0;
    if (cost <= 0) {
      toast.error("Enter the cost of the asset");
      return;
    }
    if (!f.purchaseDate) {
      toast.error("Enter the purchase / in-service date");
      return;
    }
    const life = parseFloat(f.lifeYears) || 0, rate = parseFloat(f.rate) || 0, salv = parseFloat(f.salvage) || 0;
    if (f.method === "SLM" && life <= 0) {
      toast.error("Enter the useful life in years");
      return;
    }
    if (f.method === "WDV" && rate <= 0) {
      toast.error("Enter the WDV rate (% per year)");
      return;
    }
    if (salv >= cost) {
      toast.error("Salvage value must be less than cost");
      return;
    }
    if (f.mode === "opening" && (parseFloat(f.accDepBF) || 0) >= cost) {
      toast.error("Accumulated depreciation b/f must be less than cost");
      return;
    }
    const exists = list.find((x) => x.id === f.id);
    let code = f.code;
    if (!code) {
      let n = list.length + 1;
      code = "FA-" + String(n).padStart(4, "0");
      while (list.some((x) => x.code === code)) {
        n++;
        code = "FA-" + String(n).padStart(4, "0");
      }
    }
    const rec = { ...f, code, name: f.name.trim(), cost, salvage: salv, lifeYears: life, rate, accDepBF: parseFloat(f.accDepBF) || 0, depFrom: f.depFrom || f.purchaseDate, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    if (rec.mode === "new" && !rec.voucherNo) {
      rec.voucherNo = nextVoucherNo();
      rec.txnRefNo = nextTxnRefNo(rec.purchaseDate);
    }
    if (!exists) {
      rec.createdAt = (/* @__PURE__ */ new Date()).toISOString();
      rec.createdBy = (currentUser == null ? void 0 : currentUser.email) || "";
    }
    S.set(SK.FA, exists ? list.map((x) => x.id === f.id ? rec : x) : [...list, rec]);
    logAudit(exists ? "FIXED_ASSET_EDITED" : "FIXED_ASSET_ADDED", `${rec.code} ${rec.name} \u2014 ${fmt(cost)}`, currentUser);
    reload();
    setForm(null);
    toast.success(exists ? "Asset updated \u2014 depreciation journals recalculated" : "Asset added \u2014 monthly depreciation will post automatically");
  };
  const delAsset = (a) => {
    if (!isAdmin) {
      toast.error("Only Admin can delete an asset");
      return;
    }
    if (!window.confirm(`Delete ${a.code} \u2014 ${a.name}?

The purchase / opening entry and every depreciation journal this asset generated will disappear from the ledger.`)) return;
    S.set(SK.FA, list.filter((x) => x.id !== a.id));
    reload();
    if (selId === a.id) setSelId(null);
    logAudit("FIXED_ASSET_DELETED", `${a.code} ${a.name}`, currentUser);
    toast.info("Asset deleted");
  };
  const startDispose = (a) => setDispose({ a, date: today(), proceeds: "", receivedKey: (getPaymentLedgers()[0] || {}).key || "TRADE_RECEIVABLE" });
  const dispCalc = dispose ? (() => {
    const acc = faSchedule(dispose.a, dispose.date).acc;
    const nbv = r2((parseFloat(dispose.a.cost) || 0) - acc);
    const p = parseFloat(dispose.proceeds) || 0;
    return { acc, nbv, diff: r2(p - nbv) };
  })() : null;
  const confirmDispose = () => {
    const d = dispose;
    if (d.date < (d.a.purchaseDate || "") && d.a.mode !== "opening") {
      toast.error("Sale date cannot be before the purchase date");
      return;
    }
    S.set(SK.FA, list.map((x) => x.id === d.a.id ? { ...x, disposal: { date: d.date, proceeds: parseFloat(d.proceeds) || 0, receivedKey: d.receivedKey, voucherNo: nextVoucherNo(), txnRefNo: nextTxnRefNo(d.date) } } : x));
    logAudit("FIXED_ASSET_DISPOSED", `${d.a.code} ${d.a.name} sold for ${fmt(parseFloat(d.proceeds) || 0)}`, currentUser);
    reload();
    setDispose(null);
    toast.success("Disposal posted \u2014 gain / loss on sale booked automatically");
  };
  const undoDispose = (a) => {
    if (!isAdmin) {
      toast.error("Only Admin can reverse a disposal");
      return;
    }
    if (!window.confirm("Reverse the disposal of " + a.name + "?")) return;
    const { disposal, ...rest } = a;
    S.set(SK.FA, list.map((x) => x.id === a.id ? rest : x));
    reload();
    toast.info("Disposal reversed");
  };
  const doExport = (f) => {
    if (tab === "schedule") exportTableAs(
      f,
      `FixedAssetSchedule_FY${selFY}`,
      `Fixed Asset Schedule \u2014 FY ${selFY}-${String(selFY + 1).slice(2)}`,
      ["Asset Code", "Asset", "Gross Opening", "Additions", "Disposals", "Gross Closing", "Dep. Opening", "Dep. For Year", "Dep. On Disposals", "Dep. Closing", "Net Block Closing", "Net Block Opening"],
      [
        ...rows.map((r) => [r.a.code, r.a.name, fmtN(r.grossOpen), fmtN(r.additions), fmtN(r.grossDisp), fmtN(r.grossClose), fmtN(r.accOpen), fmtN(r.depYear), fmtN(r.accDisp), fmtN(r.accClose), fmtN(r.netClose), fmtN(r.netOpen)]),
        ["", "Total", fmtN(tot.gOpen), fmtN(tot.add), fmtN(tot.dis), fmtN(tot.gClose), fmtN(tot.aOpen), fmtN(tot.dep), fmtN(tot.aDis), fmtN(tot.aClose), fmtN(tot.net), fmtN(tot.netO)]
      ]
    );
    else exportTableAs(
      f,
      "FixedAssetRegister",
      "Fixed Asset Register",
      ["Code", "Asset", "Category", "Acquired", "Method", "Cost", "Accumulated Dep.", "Book Value", "Status"],
      list.map((a) => {
        const s = faSchedule(a, today());
        return [a.code, a.name, a.category, fmtDate(faAcquiredOn(a) === "1900-01-01" ? a.depFrom : a.purchaseDate), a.method === "WDV" ? `WDV ${a.rate}%` : `SLM ${a.lifeYears}y`, fmtN(a.cost), fmtN(s.acc), fmtN((parseFloat(a.cost) || 0) - s.acc), a.disposal ? "Sold " + fmtDate(a.disposal.date) : "In use"];
      })
    );
  };
  const allDep = useMemo(() => {
    const out = [];
    list.forEach((a) => faSchedule(a, today()).rows.forEach((r) => out.push({ ...r, a })));
    return out.sort((x, y) => y.date.localeCompare(x.date));
  }, [list]);
  const sel = list.find((a) => a.id === selId);
  return /* @__PURE__ */ React.createElement(PageShell, null, /* @__PURE__ */ React.createElement(InfoNote, null, "Add each asset once. From then on the software posts ", /* @__PURE__ */ React.createElement("b", null, "depreciation journals automatically at every month-end"), " (Dr Depreciation, Cr Accumulated Depreciation) \u2014 they show in the General Ledger, Trial Balance, P&L and Balance Sheet with a ", /* @__PURE__ */ React.createElement("b", null, "DEP-"), " voucher number. Selling an asset books the gain or loss for you."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Kpi, { label: "Gross block", value: fmt(tot.gClose), sub: `${rows.filter((r) => r.grossClose > 0).length} assets in use` }), /* @__PURE__ */ React.createElement(Kpi, { label: "Accumulated depreciation", value: fmt(tot.aClose), color: "var(--gold)" }), /* @__PURE__ */ React.createElement(Kpi, { label: "Net book value", value: fmt(tot.net), color: "var(--green)" }), /* @__PURE__ */ React.createElement(Kpi, { label: `Depreciation FY ${selFY}-${String(selFY + 1).slice(2)}`, value: fmt(tot.dep), color: "var(--primary2)" })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 12 } }, /* @__PURE__ */ React.createElement(FyPicker, { value: selFY, onChange: setSelFY }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(ExportMenu, { onExport: doExport, disabled: !list.length }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: startAdd }, "+ Add Asset")), /* @__PURE__ */ React.createElement(TabBar, { value: tab, onChange: setTab, tabs: [["register", "Asset Register"], ["schedule", "FA Schedule (Sch. III)"], ["journals", "Depreciation Journals"]] }), form && /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 16, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, list.some((x) => x.id === form.id) ? "Edit asset" : "New fixed asset"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 } }, [["new", "New purchase \u2014 post the purchase entry"], ["bill", "Already booked via a Purchase Bill"], ["opening", "Existing asset (opening balance)"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, className: "btn btn-sm " + (form.mode === k ? "btn-primary" : "btn-outline"), onClick: () => setForm((f) => ({ ...f, mode: k })) }, l))), form.mode === "bill" && /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Purchase bill (optional \u2014 pre-fills cost & date)"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: form.billId || "", onChange: (e) => pickBill(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 choose a bill \u2014"), bills.map((b) => /* @__PURE__ */ React.createElement("option", { key: b.id, value: b.id }, b.billNo || b.id, " \u2014 ", b.vendor || "Vendor", " \u2014 ", fmt(b.total), b.expenseAccountKey === "FIXED_ASSETS" ? "" : "  (head: " + coaByKey(b.expenseAccountKey || guessExpenseAccount(b.category)).name + ")"))), (() => {
    const b = bills.find((x) => x.id === form.billId);
    return b && b.expenseAccountKey !== "FIXED_ASSETS" ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--red)", marginTop: 4 } }, "\u26A0 This bill is not booked to \u201CFixed Assets (Tangible)\u201D, so its cost sits in an expense. Change the bill\u2019s Expense Head to Fixed Assets so the asset is capitalised \u2014 otherwise the cost is expensed AND depreciated.") : null;
  })(), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", marginTop: 4 } }, "The bill posts the cost to Fixed Assets; this register only adds the depreciation, so nothing is counted twice.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "field", style: { flex: "2 1 220px" } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Asset name *"), /* @__PURE__ */ React.createElement("input", { className: "field-input", value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), placeholder: "e.g. Dell Latitude laptop" })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { flex: "1 1 190px" } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Asset class"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: form.category, onChange: (e) => preset(e.target.value) }, FA_PRESETS.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.name }, p.name)))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { flex: "1 1 150px" } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Serial / location"), /* @__PURE__ */ React.createElement("input", { className: "field-input", value: form.serial || "", onChange: (e) => setForm((f) => ({ ...f, serial: e.target.value })), placeholder: "optional" }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, form.mode === "opening" ? "Original purchase date" : "Purchase date *"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: form.purchaseDate, onChange: (e) => setForm((f) => ({ ...f, purchaseDate: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, form.mode === "opening" ? "Depreciate from (books start)" : "In-service date"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: form.depFrom || "", onChange: (e) => setForm((f) => ({ ...f, depFrom: e.target.value })) }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text3)", marginTop: 3 } }, form.mode === "opening" ? "First month the software should post depreciation" : "Blank = purchase date. First month is pro-rated by days.")), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Cost (excl. GST) *"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: form.cost, onChange: (e) => setForm((f) => ({ ...f, cost: e.target.value })), placeholder: "0.00" })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Salvage value"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: form.salvage, onChange: (e) => setForm((f) => ({ ...f, salvage: e.target.value })), placeholder: "0.00" })), form.mode === "opening" && /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Accumulated depreciation b/f"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: form.accDepBF, onChange: (e) => setForm((f) => ({ ...f, accDepBF: e.target.value })), placeholder: "0.00" })), form.mode === "new" && /* @__PURE__ */ React.createElement("div", { className: "field", style: { minWidth: 210 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Paid / payable from"), /* @__PURE__ */ React.createElement(LedgerSelect, { value: form.paidFromKey, onChange: (v) => setForm((f) => ({ ...f, paidFromKey: v })), extra: [["TRADE_PAYABLE", "Trade Payables (on credit)"], ["CAPITAL", "Owner's Capital (introduced)"], ["LT_BORROWING", "Long-term Borrowings (loan-funded)"]] }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Depreciation method"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: form.method, onChange: (e) => setForm((f) => ({ ...f, method: e.target.value })) }, /* @__PURE__ */ React.createElement("option", { value: "SLM" }, "Straight Line (SLM)"), /* @__PURE__ */ React.createElement("option", { value: "WDV" }, "Written Down Value (WDV)"))), form.method === "SLM" ? /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Useful life (years)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: form.lifeYears, onChange: (e) => setForm((f) => ({ ...f, lifeYears: e.target.value })) })) : /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "WDV rate (% per year)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: form.rate, onChange: (e) => setForm((f) => ({ ...f, rate: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", paddingBottom: 14, flex: 1, minWidth: 240 } }, "Indicative defaults: Companies Act Sch. II lives for SLM, Income-tax block rates for WDV \u2014 change them to match your policy.")), (() => {
    const c = parseFloat(form.cost) || 0;
    if (c <= 0) return null;
    const p = faSchedule({ ...form, cost: c, salvage: parseFloat(form.salvage) || 0, lifeYears: parseFloat(form.lifeYears) || 0, rate: parseFloat(form.rate) || 0, accDepBF: parseFloat(form.accDepBF) || 0, depFrom: form.depFrom || form.purchaseDate }, "9999-12-31");
    const first = p.rows.slice(0, 3);
    return first.length ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text2)", marginBottom: 10 } }, "Preview \u2014 first months: ", first.map((r) => `${r.ym}: ${fmt(r.amount)}`).join("  \xB7  "), p.rows.length > 3 ? `  \u2026  fully depreciated after ${p.rows.length} months` : "") : null;
  })(), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: saveAsset }, "Save asset"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: () => setForm(null) }, "Cancel"))), dispose && /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 16, marginBottom: 16, borderColor: "var(--gold)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 10 } }, "Sell / dispose \u2014 ", dispose.a.code, " ", dispose.a.name), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Date of sale"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: dispose.date, onChange: (e) => setDispose((d) => ({ ...d, date: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Sale proceeds (0 if scrapped)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: dispose.proceeds, onChange: (e) => setDispose((d) => ({ ...d, proceeds: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { minWidth: 230 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Proceeds received in"), /* @__PURE__ */ React.createElement(LedgerSelect, { value: dispose.receivedKey, onChange: (v) => setDispose((d) => ({ ...d, receivedKey: v })), extra: [["TRADE_RECEIVABLE", "Trade Receivables (sold on credit)"]] }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, marginBottom: 10 } }, "Depreciation up to sale: ", /* @__PURE__ */ React.createElement("b", null, fmt(dispCalc.acc)), " \xB7 Book value: ", /* @__PURE__ */ React.createElement("b", null, fmt(dispCalc.nbv)), " \xB7 ", dispCalc.diff >= 0 ? "Gain on sale" : "Loss on sale", ": ", /* @__PURE__ */ React.createElement("b", { style: { color: dispCalc.diff >= 0 ? "var(--green)" : "var(--red)" } }, fmt(Math.abs(dispCalc.diff)))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", marginBottom: 10 } }, "GST on the sale (if any) is not included here \u2014 raise a sales invoice for it separately."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: confirmDispose }, "Post disposal"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: () => setDispose(null) }, "Cancel"))), tab === "register" && (list.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "No fixed assets yet \u2014 click \u201C+ Add Asset\u201D." }) : /* @__PURE__ */ React.createElement(Wrap, { min: 980 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Code"), /* @__PURE__ */ React.createElement("th", { style: th }, "Asset"), /* @__PURE__ */ React.createElement("th", { style: th }, "Method"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Cost"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Acc. depreciation"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Book value"), /* @__PURE__ */ React.createElement("th", { style: th }, "Status"), /* @__PURE__ */ React.createElement("th", { style: th })), /* @__PURE__ */ React.createElement("tbody", null, list.map((a) => {
    const s = faSchedule(a, today());
    const bv = r2((parseFloat(a.cost) || 0) - s.acc);
    return /* @__PURE__ */ React.createElement("tr", { key: a.id, style: { borderBottom: "1px solid var(--border)", background: selId === a.id ? "var(--primary-bg)" : "transparent" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontFamily: "monospace" } }, a.code), /* @__PURE__ */ React.createElement("td", { style: td }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600 } }, a.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "var(--text3)" } }, a.category, " \xB7 ", a.mode === "opening" ? "opening balance" : a.mode === "bill" ? "via bill" : "purchased " + fmtDate(a.purchaseDate))), /* @__PURE__ */ React.createElement("td", { style: td }, a.method === "WDV" ? `WDV ${a.rate}%` : `SLM ${a.lifeYears} yrs`), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(a.cost)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(s.acc)), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 700 } }, fmt(bv)), /* @__PURE__ */ React.createElement("td", { style: td }, a.disposal ? /* @__PURE__ */ React.createElement("span", { className: "badge badge-gold" }, "Sold ", fmtDate(a.disposal.date)) : bv <= (parseFloat(a.salvage) || 0) + 0.01 ? /* @__PURE__ */ React.createElement("span", { className: "badge badge-blue" }, "Fully depreciated") : /* @__PURE__ */ React.createElement("span", { className: "badge badge-green" }, "In use")), /* @__PURE__ */ React.createElement("td", { style: { ...td, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setSelId(selId === a.id ? null : a.id) }, selId === a.id ? "Hide" : "Schedule"), " ", /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setForm({ ...a, cost: a.cost, salvage: a.salvage || "", accDepBF: a.accDepBF || "" }) }, "Edit"), " ", !a.disposal ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => startDispose(a) }, "Sell") : /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => undoDispose(a) }, "Undo sale"), " ", /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => delAsset(a) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 }))));
  })))), tab === "register" && sel && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "Month-wise depreciation \u2014 ", sel.code, " ", sel.name), (() => {
    const s = faSchedule(sel, today());
    return s.rows.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "No depreciation has fallen due yet \u2014 the first journal posts at the end of the in-service month." }) : /* @__PURE__ */ React.createElement(Wrap, { min: 640 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Month"), /* @__PURE__ */ React.createElement("th", { style: th }, "Posted on"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Depreciation"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Accumulated"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Book value"), /* @__PURE__ */ React.createElement("th", { style: th }, "Voucher")), /* @__PURE__ */ React.createElement("tbody", null, s.rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.ym, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, r.ym), /* @__PURE__ */ React.createElement("td", { style: td }, fmtDate(r.date)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(r.amount)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(r.accAfter)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(r.wdvAfter)), /* @__PURE__ */ React.createElement("td", { style: { ...td, fontFamily: "monospace", fontSize: 11 } }, "DEP-", String(sel.code).replace(/\s+/g, "").toUpperCase(), "-", r.ym.replace("-", ""))))));
  })()), tab === "schedule" && (rows.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "No assets in this financial year." }) : /* @__PURE__ */ React.createElement(Wrap, { min: 1100 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Asset"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Gross: Opening"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Additions"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Disposals"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Gross: Closing"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Dep: Opening"), /* @__PURE__ */ React.createElement("th", { style: thR }, "For the year"), /* @__PURE__ */ React.createElement("th", { style: thR }, "On disposals"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Dep: Closing"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Net block"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Prev. net block")), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.a.id, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, /* @__PURE__ */ React.createElement("b", null, r.a.code), " ", r.a.name), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.grossOpen)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.additions)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.grossDisp)), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 700 } }, fmtN(r.grossClose)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.accOpen)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.depYear)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.accDisp)), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 700 } }, fmtN(r.accClose)), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 700, color: "var(--green)" } }, fmtN(r.netClose)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.netOpen)))), /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)", fontWeight: 800 } }, /* @__PURE__ */ React.createElement("td", { style: td }, "Total"), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.gOpen)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.add)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.dis)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.gClose)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.aOpen)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.dep)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.aDis)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.aClose)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.net)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(tot.netO)))))), tab === "journals" && (allDep.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "No depreciation journals yet." }) : /* @__PURE__ */ React.createElement(Wrap, { min: 760 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Date"), /* @__PURE__ */ React.createElement("th", { style: th }, "Asset"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Debit: Depreciation"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Credit: Accumulated Dep."), /* @__PURE__ */ React.createElement("th", { style: th }, "Voucher No.")), /* @__PURE__ */ React.createElement("tbody", null, allDep.slice(0, 400).map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.a.id + r.ym, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, fmtDate(r.date)), /* @__PURE__ */ React.createElement("td", { style: td }, r.a.code, " \u2014 ", r.a.name), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(r.amount)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(r.amount)), /* @__PURE__ */ React.createElement("td", { style: { ...td, fontFamily: "monospace", fontSize: 11 } }, "DEP-", String(r.a.code).replace(/\s+/g, "").toUpperCase(), "-", r.ym.replace("-", ""))))))));
};
const blankRJV = (kind) => ({
  id: newId("RJ"),
  name: "",
  kind: kind || "fixed",
  active: true,
  startDate: today(),
  frequency: "monthly",
  count: "",
  endDate: "",
  refNo: "",
  generated: 0,
  lines: [{ account: "RENT_EXP", desc: "", debit: "", credit: "" }, { account: (getPaymentLedgers()[0] || {}).key || "CASH_IN_HAND", desc: "", debit: "", credit: "" }],
  loanKey: "",
  payKey: (getPaymentLedgers()[0] || {}).key || "CASH_IN_HAND",
  principal: "",
  rate: "",
  tenure: "",
  emiOverride: "",
  total: "",
  months: "",
  expenseKey: "RENT_EXP"
});
const rjvPerPeriod = (t) => t.kind === "emi" ? emiOf(t.principal, t.rate, t.tenure) : t.kind === "prepaid" ? +t.months > 0 ? r2((+t.total || 0) / +t.months) : 0 : r2((t.lines || []).reduce((s, l) => s + (parseFloat(l.debit) || 0), 0));
const RecurringJournalsPage = ({ currentUser }) => {
  const [list, setList] = useState(S.get(SK.RJV, []) || []);
  const [form, setForm] = useState(null);
  const [jvs, setJvs] = useState(getManualJournal());
  const isAdmin = isAdminUser(currentUser);
  const reload = () => {
    setList(S.get(SK.RJV, []) || []);
    setJvs(getManualJournal());
  };
  const runNow = () => {
    const n = runRecurringJournals(currentUser);
    reload();
    n ? toast.success(`${n} journal voucher${n === 1 ? "" : "s"} posted`) : toast.info("Nothing is due \u2014 every recurring entry is up to date");
  };
  const save = () => {
    const f = form;
    if (!f.name.trim()) {
      toast.error("Give this recurring entry a name");
      return;
    }
    if (!f.startDate) {
      toast.error("Pick the first posting date");
      return;
    }
    if (f.kind === "fixed") {
      const ls = (f.lines || []).filter((l) => l.account && (parseFloat(l.debit) || parseFloat(l.credit)));
      const d = ls.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0), c = ls.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
      if (ls.length < 2 || Math.abs(d - c) > 0.01 || d <= 0) {
        toast.error("Debits must equal credits (at least two lines)");
        return;
      }
    }
    if (f.kind === "emi") {
      if (!f.loanKey) {
        toast.error("Choose the loan ledger");
        return;
      }
      if (!(+f.principal > 0) || !(+f.tenure > 0)) {
        toast.error("Enter the loan principal and number of instalments");
        return;
      }
    }
    if (f.kind === "prepaid") {
      if (!(+f.total > 0) || !(+f.months > 0)) {
        toast.error("Enter the prepaid amount and number of months");
        return;
      }
      if (!f.expenseKey) {
        toast.error("Choose the expense ledger");
        return;
      }
    }
    const rec = { ...f, name: f.name.trim(), lines: (f.lines || []).filter((l) => l.account && (parseFloat(l.debit) || parseFloat(l.credit))).map((l) => ({ account: l.account, desc: l.desc || "", debit: parseFloat(l.debit) || 0, credit: parseFloat(l.credit) || 0 })) };
    const exists = list.some((x) => x.id === f.id);
    S.set(SK.RJV, exists ? list.map((x) => x.id === f.id ? rec : x) : [...list, rec]);
    logAudit("RECURRING_JV_SAVED", rec.name, currentUser);
    setForm(null);
    const n = runRecurringJournals(currentUser);
    reload();
    toast.success(n ? `Saved \u2014 ${n} past-due voucher${n === 1 ? "" : "s"} posted now; the rest will post on their due dates` : "Saved \u2014 it will post automatically on each due date");
  };
  const toggle = (t) => {
    S.set(SK.RJV, list.map((x) => x.id === t.id ? { ...x, active: !x.active } : x));
    reload();
  };
  const del = (t) => {
    if (!isAdmin) {
      toast.error("Only Admin can delete");
      return;
    }
    if (!window.confirm(`Delete \u201C${t.name}\u201D?

Vouchers already posted stay in the books; future ones stop.`)) return;
    S.set(SK.RJV, list.filter((x) => x.id !== t.id));
    reload();
  };
  const upLine = (i, k, v) => setForm((f) => ({ ...f, lines: f.lines.map((l, j) => j === i ? { ...l, [k]: v } : l) }));
  const locked = form && form.kind !== "fixed" && (parseInt(form.generated, 10) || 0) > 0;
  const emiRows = form && form.kind === "emi" ? emiSchedule(form.principal, form.rate, form.tenure, +form.emiOverride || 0) : [];
  const ppRows = form && form.kind === "prepaid" ? prepaidSchedule(form.total, form.months) : [];
  const fd = form ? (form.lines || []).reduce((s, l) => s + (parseFloat(l.debit) || 0), 0) : 0, fc = form ? (form.lines || []).reduce((s, l) => s + (parseFloat(l.credit) || 0), 0) : 0;
  const generatedJvs = jvs.filter((j) => j.recurringId).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 40);
  const typeLabel = { fixed: "Fixed entry", emi: "Loan EMI", prepaid: "Prepaid amortisation" };
  return /* @__PURE__ */ React.createElement(PageShell, null, /* @__PURE__ */ React.createElement(InfoNote, null, "Set up rent, loan EMIs, insurance or prepaid amortisation ", /* @__PURE__ */ React.createElement("b", null, "once"), ". A real Journal Voucher is posted automatically on every due date (when anyone opens the app) \u2014 no more month-end reminders. EMI entries split each instalment into principal and interest using the loan\u2019s amortisation schedule."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => setForm(blankRJV("fixed")) }, "+ Rent / fixed entry"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: () => setForm(blankRJV("emi")) }, "+ Loan EMI"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: () => setForm(blankRJV("prepaid")) }, "+ Prepaid amortisation"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline-primary", onClick: runNow }, /* @__PURE__ */ React.createElement(Ic, { n: "refresh", s: 13 }), " Post due entries now")), form && /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 16, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 10 } }, list.some((x) => x.id === form.id) ? "Edit" : "New", " recurring entry \u2014 ", typeLabel[form.kind]), locked && /* @__PURE__ */ React.createElement(InfoNote, { tone: "warn" }, form.generated, " instalment(s) have already been posted, so the schedule figures are locked. You can still change the name, ledgers for future vouchers, or pause it."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "field", style: { flex: "2 1 240px" } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Name *"), /* @__PURE__ */ React.createElement("input", { className: "field-input", value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), placeholder: form.kind === "emi" ? "e.g. HDFC term loan EMI" : form.kind === "prepaid" ? "e.g. Insurance FY26-27" : "e.g. Office rent \u2014 Whitefield" })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, form.kind === "fixed" ? "First posting date" : form.kind === "emi" ? "Next EMI date" : "First amortisation date", " *"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: form.startDate, disabled: locked, onChange: (e) => setForm((f) => ({ ...f, startDate: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Reference no."), /* @__PURE__ */ React.createElement("input", { className: "field-input", value: form.refNo || "", onChange: (e) => setForm((f) => ({ ...f, refNo: e.target.value })), placeholder: "Loan a/c no., agreement no." }))), form.kind === "fixed" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Repeats"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: form.frequency, onChange: (e) => setForm((f) => ({ ...f, frequency: e.target.value })) }, RJV_FREQ.map(([k, l]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, l)))), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Number of times"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: form.count, onChange: (e) => setForm((f) => ({ ...f, count: e.target.value })), placeholder: "blank = no limit" })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Or stop after"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: form.endDate || "", onChange: (e) => setForm((f) => ({ ...f, endDate: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text3)" } }, "Quick start:"), [["Rent", "RENT_EXP"], ["Insurance", "OTHER_EXP"], ["Salary accrual", "EMPLOYEE_EXP"], ["Subscription", "OTHER_EXP"]].map(([l, k]) => /* @__PURE__ */ React.createElement("button", { key: l, className: "btn btn-sm btn-outline", onClick: () => setForm((f) => ({ ...f, name: f.name || l, lines: [{ ...f.lines[0], account: k }, f.lines[1]] })) }, l))), /* @__PURE__ */ React.createElement("div", { className: "dt-wrap", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("table", { className: "dt", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Account"), /* @__PURE__ */ React.createElement("th", null, "Line note"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Debit"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Credit"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, form.lines.map((l, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", { style: { minWidth: 260 } }, /* @__PURE__ */ React.createElement(AccountSelect, { value: l.account, onChange: (v) => upLine(i, "account", v), createType: "expense", placeholder: "Choose ledger\u2026" })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("input", { className: "field-input", value: l.desc || "", onChange: (e) => upLine(i, "desc", e.target.value) })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { textAlign: "right" }, value: l.debit, onChange: (e) => upLine(i, "debit", e.target.value) })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { textAlign: "right" }, value: l.credit, onChange: (e) => upLine(i, "credit", e.target.value) })), /* @__PURE__ */ React.createElement("td", null, form.lines.length > 2 && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => setForm((f) => ({ ...f, lines: f.lines.filter((_, j) => j !== i) })) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 })))))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center", marginBottom: 10, fontSize: 12.5 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setForm((f) => ({ ...f, lines: [...f.lines, blankJVLine()] })) }, "+ Add line"), /* @__PURE__ */ React.createElement("span", null, "Debit ", fmt(fd), " \xB7 Credit ", fmt(fc)), /* @__PURE__ */ React.createElement("b", { style: { color: Math.abs(fd - fc) < 0.01 && fd > 0 ? "var(--green)" : "var(--red)" } }, Math.abs(fd - fc) < 0.01 && fd > 0 ? "\u2713 Balanced" : "Difference " + fmt(Math.abs(fd - fc))))), form.kind === "emi" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "field", style: { minWidth: 260 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Loan ledger (liability) *"), /* @__PURE__ */ React.createElement(AccountSelect, { value: form.loanKey, onChange: (v) => setForm((f) => ({ ...f, loanKey: v })), types: ["liability"], createType: "liability", placeholder: "e.g. Long-term Borrowings" })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { minWidth: 230 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "EMI paid from *"), /* @__PURE__ */ React.createElement(LedgerSelect, { value: form.payKey, onChange: (v) => setForm((f) => ({ ...f, payKey: v })) }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Outstanding principal *"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", disabled: locked, value: form.principal, onChange: (e) => setForm((f) => ({ ...f, principal: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Interest rate % p.a."), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", disabled: locked, value: form.rate, onChange: (e) => setForm((f) => ({ ...f, rate: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Instalments remaining *"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", disabled: locked, value: form.tenure, onChange: (e) => setForm((f) => ({ ...f, tenure: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "EMI (override, optional)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", disabled: locked, value: form.emiOverride || "", onChange: (e) => setForm((f) => ({ ...f, emiOverride: e.target.value })), placeholder: String(emiOf(form.principal, form.rate, form.tenure) || "") }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", marginBottom: 8 } }, "For a loan already running, enter the ", /* @__PURE__ */ React.createElement("b", null, "current outstanding principal"), " and the ", /* @__PURE__ */ React.createElement("b", null, "instalments still to pay"), ". The loan receipt itself is recorded in Bank Reconciliation (post it to the loan ledger)."), emiRows.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10, fontSize: 12.5 } }, "EMI ", /* @__PURE__ */ React.createElement("b", null, fmt(emiRows[0].emi)), " \xB7 total interest ", /* @__PURE__ */ React.createElement("b", null, fmt(emiRows.reduce((s, r) => s + r.interest, 0))), " \xB7 total payable ", /* @__PURE__ */ React.createElement("b", null, fmt(emiRows.reduce((s, r) => s + r.emi, 0))), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: 170, overflow: "auto", marginTop: 6, border: "1px solid var(--border)", borderRadius: 8 } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { background: "var(--card2)" } }, /* @__PURE__ */ React.createElement("th", { style: th }, "#"), /* @__PURE__ */ React.createElement("th", { style: th }, "Date"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Principal"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Interest"), /* @__PURE__ */ React.createElement("th", { style: thR }, "EMI"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Balance"))), /* @__PURE__ */ React.createElement("tbody", null, emiRows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.k, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, r.k + 1), /* @__PURE__ */ React.createElement("td", { style: td }, form.startDate ? fmtDate(rjvDate(form, r.k)) : ""), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.principal)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.interest)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.emi)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtN(r.balance))))))))), form.kind === "prepaid" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "field", style: { minWidth: 260 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Expense ledger *"), /* @__PURE__ */ React.createElement(AccountSelect, { value: form.expenseKey, onChange: (v) => setForm((f) => ({ ...f, expenseKey: v })), types: ["expense"], createType: "expense" })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Total prepaid amount *"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", disabled: locked, value: form.total, onChange: (e) => setForm((f) => ({ ...f, total: e.target.value })) })), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Spread over (months) *"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", disabled: locked, value: form.months, onChange: (e) => setForm((f) => ({ ...f, months: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", marginBottom: 8 } }, "Record the advance payment first (Bank Reconciliation \u2192 post to \u201CPrepaid Expenses\u201D, or the Journal template). Each month this posts ", /* @__PURE__ */ React.createElement("b", null, "Dr ", coaByKey(form.expenseKey).name, " / Cr Prepaid Expenses"), ".", ppRows.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, " Monthly amount ", /* @__PURE__ */ React.createElement("b", null, fmt(ppRows[0].amount)), ppRows.length > 1 && ppRows[ppRows.length - 1].amount !== ppRows[0].amount ? ` (last month ${fmt(ppRows[ppRows.length - 1].amount)} to absorb rounding)` : "", "."))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: save }, "Save & activate"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline", onClick: () => setForm(null) }, "Cancel"))), list.length === 0 && !form ? /* @__PURE__ */ React.createElement(Empty, { text: "No recurring entries yet. Add your rent, loan EMI or an insurance premium above." }) : list.length > 0 && /* @__PURE__ */ React.createElement(Wrap, { min: 900 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Name"), /* @__PURE__ */ React.createElement("th", { style: th }, "Type"), /* @__PURE__ */ React.createElement("th", { style: th }, "Repeats"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Per period"), /* @__PURE__ */ React.createElement("th", { style: th }, "Progress"), /* @__PURE__ */ React.createElement("th", { style: th }, "Next posting"), /* @__PURE__ */ React.createElement("th", { style: th }, "Status"), /* @__PURE__ */ React.createElement("th", { style: th })), /* @__PURE__ */ React.createElement("tbody", null, list.map((t) => {
    const total = rjvTotal(t);
    const gen = parseInt(t.generated, 10) || 0;
    const done = gen >= total && total < 600;
    const nd = done ? null : rjvDate(t, gen);
    const over = nd && nd <= today() && t.active;
    return /* @__PURE__ */ React.createElement("tr", { key: t.id, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 600 } }, t.name), /* @__PURE__ */ React.createElement("td", { style: td }, typeLabel[t.kind]), /* @__PURE__ */ React.createElement("td", { style: td }, t.kind === "fixed" ? (RJV_FREQ.find((f) => f[0] === t.frequency) || [])[1] : "Monthly"), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(rjvPerPeriod(t))), /* @__PURE__ */ React.createElement("td", { style: td }, gen, total < 600 ? ` / ${total}` : "", " posted"), /* @__PURE__ */ React.createElement("td", { style: td }, done ? /* @__PURE__ */ React.createElement("span", { className: "badge badge-green" }, "Completed") : nd ? /* @__PURE__ */ React.createElement("span", { style: { color: over ? "var(--red)" : "var(--text)" } }, fmtDate(nd), over ? " (due)" : "") : "\u2014"), /* @__PURE__ */ React.createElement("td", { style: td }, t.active ? /* @__PURE__ */ React.createElement("span", { className: "badge badge-green" }, "Active") : /* @__PURE__ */ React.createElement("span", { className: "badge badge-gold" }, "Paused")), /* @__PURE__ */ React.createElement("td", { style: { ...td, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setForm({ ...t, lines: t.lines && t.lines.length ? t.lines : [{ account: "", desc: "", debit: "", credit: "" }, { account: "", desc: "", debit: "", credit: "" }] }) }, "Edit"), " ", /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => toggle(t) }, t.active ? "Pause" : "Resume"), " ", /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-danger btn-icon", onClick: () => del(t) }, /* @__PURE__ */ React.createElement(Ic, { n: "trash", s: 11 }))));
  }))), generatedJvs.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "Recently auto-posted vouchers"), /* @__PURE__ */ React.createElement(Wrap, { min: 680 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Date"), /* @__PURE__ */ React.createElement("th", { style: th }, "Voucher No."), /* @__PURE__ */ React.createElement("th", { style: th }, "Narration"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Amount")), /* @__PURE__ */ React.createElement("tbody", null, generatedJvs.map((j) => /* @__PURE__ */ React.createElement("tr", { key: j.id, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, fmtDate(j.date)), /* @__PURE__ */ React.createElement("td", { style: { ...td, fontFamily: "monospace", fontSize: 11 } }, j.voucherNo), /* @__PURE__ */ React.createElement("td", { style: td }, j.narration), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt((j.lines || []).reduce((s, l) => s + (l.debit || 0), 0))))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)", marginTop: 6 } }, "Posted vouchers are ordinary Journal Vouchers \u2014 you can see (and reverse) them under Accounting \u2192 Journal Vouchers.")));
};
const AdvanceApplicationPage = ({ currentUser }) => {
  const [tab, setTab] = useState("customer");
  const [tick, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  const [open, setOpen] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [amts, setAmts] = useState({});
  const [appDate, setAppDate] = useState(today());
  const advRows = useMemo(() => getAdvanceRows(), [tick]);
  const cnRows = useMemo(() => getOpenCreditNotes(), [tick]);
  const apps = getAdvApps();
  const custRows = advRows.filter((r) => r.kind === "customer" && r.balance > 0.01);
  const supRows = advRows.filter((r) => r.kind === "supplier" && r.balance > 0.01);
  const sumBal = (a) => a.reduce((s, r) => s + (r.balance != null ? r.balance : r.out), 0);
  const customers = S.get(SK.CUST, []) || [];
  const vendors = [...new Set((S.get(SK.EXP, []) || []).map((e) => e.vendor).filter(Boolean))];
  const docsFor = (src) => {
    const all = src.kind === "supplier" ? getOpenItems("debit") : getOpenItems("credit");
    const mine = showAll || !src.party ? all : all.filter((o) => sameParty(o.party, src.party));
    return mine.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  };
  const doApply = (src, o, amt) => {
    amt = r2(Math.min(amt, src.balance, o.out));
    if (amt <= 4e-3) {
      toast.error("Nothing to apply");
      return 0;
    }
    if (src.kind !== "cn" && src.date && appDate < src.date) {
      toast.error("Application date cannot be before the advance date (" + fmtDate(src.date) + ")");
      return 0;
    }
    applyAdvance({ kind: src.kind, advTxnId: src.id, party: src.party || o.party, docKind: src.kind === "supplier" ? "expense" : "invoice", docRef: o.ref, docNo: o.docNo || o.ref, amt, date: appDate, user: currentUser });
    logAudit("ADVANCE_APPLIED", `${src.kind === "cn" ? "Credit note " : "Advance "}${src.label || src.id} \u2192 ${o.docNo || o.ref}: ${fmt(amt)}`, currentUser);
    return amt;
  };
  const applyOne = (src, o) => {
    const k = src.id + "|" + o.ref;
    const want = amts[k] !== void 0 && amts[k] !== "" ? parseFloat(amts[k]) : Math.min(src.balance, o.out);
    const done = doApply(src, o, want);
    if (done) {
      toast.success(`${fmt(done)} applied to ${o.docNo || o.ref}`);
      setAmts((a) => ({ ...a, [k]: "" }));
      bump();
      if (src.balance - done <= 0.01) setOpen(null);
    }
  };
  const applyAuto = (src) => {
    let rem = src.balance, n = 0, total = 0;
    const docs = docsFor(src);
    if (!docs.length) {
      toast.info("No open " + (src.kind === "supplier" ? "bills" : "invoices") + " for this party");
      return;
    }
    docs.forEach((o) => {
      if (rem <= 4e-3) return;
      const done = doApply({ ...src, balance: rem }, o, Math.min(rem, o.out));
      if (done) {
        rem = r2(rem - done);
        total += done;
        n++;
      }
    });
    bump();
    if (n) {
      toast.success(`${fmt(total)} applied across ${n} ${src.kind === "supplier" ? "bill" : "invoice"}${n === 1 ? "" : "s"} (oldest first)`);
      setOpen(null);
    }
  };
  const undo = (a) => {
    if (!window.confirm(`Reverse this application of ${fmt(a.amt)} to ${a.docNo}?

The ${a.docKind === "expense" ? "bill" : "invoice"} becomes outstanding again.`)) return;
    reverseAdvanceApp(a.id);
    logAudit("ADVANCE_APPLICATION_REVERSED", `${a.advTxnId} \u2192 ${a.docNo} ${fmt(a.amt)}`, currentUser);
    bump();
    toast.info("Reversed");
  };
  const tag = (r, name) => {
    tagAdvanceParty(r.txnId, name.trim());
    bump();
    toast.success("Party saved");
  };
  const Panel = ({ src }) => {
    const docs = docsFor(src);
    return /* @__PURE__ */ React.createElement("div", { style: { background: "var(--card2)", padding: 12, borderTop: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12 } }, "Apply ", /* @__PURE__ */ React.createElement("b", null, fmt(src.balance)), " available to:"), /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11.5, display: "flex", gap: 5, alignItems: "center", cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: showAll, onChange: (e) => setShowAll(e.target.checked) }), " show other parties too"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), docs.length > 0 && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-primary", onClick: () => applyAuto(src) }, "Apply oldest-first \u2014 one click"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => setOpen(null) }, "Close")), docs.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--text3)" } }, "No open ", src.kind === "supplier" ? "bills" : "invoices", " found", src.party ? ` for \u201C${src.party}\u201D` : "", ". ", src.party && !showAll ? "Tick \u201Cshow other parties\u201D if the name is spelt differently." : "") : /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", maxHeight: 240, overflow: "auto" } }, docs.map((o) => {
      const k = src.id + "|" + o.ref;
      return /* @__PURE__ */ React.createElement("div", { key: o.ref, style: { display: "flex", gap: 10, alignItems: "center", padding: "8px 12px", borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 12.5 } }, o.docNo || o.ref, " \u2014 ", o.party), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)" } }, fmtDate(o.date), " \xB7 due ", fmtDate(o.due), " \xB7 outstanding ", fmt(o.out))), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { width: 110, padding: "5px 8px", textAlign: "right" }, placeholder: String(Math.min(src.balance, o.out)), value: amts[k] || "", onChange: (e) => setAmts((a) => ({ ...a, [k]: e.target.value })) }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-primary", onClick: () => applyOne(src, o) }, "Apply"));
    })));
  };
  const advTable = (rows, kind) => rows.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: kind === "customer" ? "No unapplied customer advances. Advances appear here when a bank receipt is posted to \u201CAdvances from Customers\u201D or exceeds the invoices it settles." : "No unapplied supplier advances. They appear when a bank payment is posted to \u201CAdvance to supplier\u201D or exceeds the bills it settles." }) : /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "90px 1.4fr 1fr 110px 110px 110px 120px", gap: 8, padding: "9px 12px", background: "var(--card2)", fontSize: 10, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px" } }, /* @__PURE__ */ React.createElement("div", null, "Date"), /* @__PURE__ */ React.createElement("div", null, kind === "customer" ? "Customer" : "Supplier"), /* @__PURE__ */ React.createElement("div", null, "Bank narration"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "Advance"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "Applied"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, "Balance"), /* @__PURE__ */ React.createElement("div", null)), rows.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.txnId, style: { borderTop: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "90px 1.4fr 1fr 110px 110px 110px 120px", gap: 8, padding: "9px 12px", alignItems: "center", fontSize: 12.5 } }, /* @__PURE__ */ React.createElement("div", null, fmtDate(r.date)), /* @__PURE__ */ React.createElement("div", null, r.party ? /* @__PURE__ */ React.createElement("b", null, r.party) : /* @__PURE__ */ React.createElement(PartyTagger, { r, kind, onSave: tag, list: kind === "customer" ? customers.map((c) => c.name) : vendors })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: r.desc }, r.desc, r.ref ? ` \xB7 ${r.ref}` : ""), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, fmt(r.amount)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", color: "var(--text3)" } }, fmt(r.used)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", fontWeight: 700, color: "var(--green)" } }, fmt(r.balance)), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-primary", onClick: () => setOpen(open === r.txnId ? null : r.txnId) }, "Apply\u2026"))), open === r.txnId && /* @__PURE__ */ React.createElement(Panel, { src: { id: r.txnId, kind, party: r.party, balance: r.balance, date: r.date, label: r.ref || r.desc } }))));
  return /* @__PURE__ */ React.createElement(PageShell, null, /* @__PURE__ */ React.createElement(InfoNote, null, "When a customer pays in advance (or you pay a supplier in advance) the money sits in an advance ledger. Pick the later invoice or bill here and it is settled in one click \u2014 the ledger entry (Dr Advance / Cr Receivable, or Dr Payable / Cr Advance) and the invoice\u2019s paid status update together. No manual journal needed."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Kpi, { label: "Customer advances held", value: fmt(sumBal(custRows)), color: "var(--primary2)", sub: `${custRows.length} unapplied` }), /* @__PURE__ */ React.createElement(Kpi, { label: "Supplier advances given", value: fmt(sumBal(supRows)), color: "var(--gold)", sub: `${supRows.length} unapplied` }), /* @__PURE__ */ React.createElement(Kpi, { label: "Open credit notes", value: fmt(sumBal(cnRows)), color: "var(--green)", sub: `${cnRows.length} not yet settled` })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 6 } }, /* @__PURE__ */ React.createElement(TabBar, { value: tab, onChange: (t) => {
    setTab(t);
    setOpen(null);
  }, tabs: [["customer", "Customer advances"], ["supplier", "Supplier advances"], ["cn", "Credit notes"], ["history", "Applications"]] }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Application date"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: appDate, onChange: (e) => setAppDate(e.target.value) }))), tab === "customer" && advTable(custRows, "customer"), tab === "supplier" && advTable(supRows, "supplier"), tab === "cn" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(InfoNote, null, "A credit note already reduces what the customer owes in your ledger. Settle it either by ", /* @__PURE__ */ React.createElement("b", null, "adjusting it against an invoice"), " (below) or by ", /* @__PURE__ */ React.createElement("b", null, "refunding the customer"), " \u2014 do that in Bank Reconciliation: open the bank debit and choose \u201CRefund to customer\u201D."), cnRows.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "Every credit note is fully settled." }) : /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" } }, cnRows.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.ref, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, padding: "10px 12px", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 12.5 } }, c.docNo, " \u2014 ", c.party), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--text3)" } }, fmtDate(c.date), " ", c.extra, " \xB7 total ", fmt(c.total), c.settled > 0 ? ` \xB7 settled ${fmt(c.settled)}` : "")), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, color: "var(--green)" } }, fmt(c.out)), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-primary", onClick: () => setOpen(open === c.ref ? null : c.ref) }, "Adjust against invoice\u2026")), open === c.ref && /* @__PURE__ */ React.createElement(Panel, { src: { id: c.ref, kind: "cn", party: c.party, balance: c.out, date: c.date, label: c.docNo } }))))), tab === "history" && (apps.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "Nothing applied yet." }) : /* @__PURE__ */ React.createElement(Wrap, { min: 820 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Date"), /* @__PURE__ */ React.createElement("th", { style: th }, "Type"), /* @__PURE__ */ React.createElement("th", { style: th }, "Party"), /* @__PURE__ */ React.createElement("th", { style: th }, "Applied to"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Amount"), /* @__PURE__ */ React.createElement("th", { style: th }, "Voucher No."), /* @__PURE__ */ React.createElement("th", { style: th })), /* @__PURE__ */ React.createElement("tbody", null, [...apps].sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((a) => /* @__PURE__ */ React.createElement("tr", { key: a.id, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, fmtDate(a.date)), /* @__PURE__ */ React.createElement("td", { style: td }, a.kind === "customer" ? "Customer advance" : a.kind === "supplier" ? "Supplier advance" : "Credit note"), /* @__PURE__ */ React.createElement("td", { style: td }, a.party), /* @__PURE__ */ React.createElement("td", { style: td }, a.docNo), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(a.amt)), /* @__PURE__ */ React.createElement("td", { style: { ...td, fontFamily: "monospace", fontSize: 11 } }, a.voucherNo), /* @__PURE__ */ React.createElement("td", { style: td }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", onClick: () => undo(a) }, "Reverse"))))))));
};
const PartyTagger = ({ r, kind, onSave, list }) => {
  const [v, setV] = useState("");
  const id = "dl" + r.txnId;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("input", { className: "field-input", list: id, style: { padding: "4px 8px", fontSize: 12 }, placeholder: kind === "customer" ? "Whose advance? type customer\u2026" : "Whose advance? type supplier\u2026", value: v, onChange: (e) => setV(e.target.value) }), /* @__PURE__ */ React.createElement("datalist", { id }, (list || []).map((n) => /* @__PURE__ */ React.createElement("option", { key: n, value: n }))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline", disabled: !v.trim(), onClick: () => onSave(r, v) }, "Save"));
};
const FxPage = ({ currentUser }) => {
  const [tick, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  const [tab, setTab] = useState("exposure");
  const [asOn, setAsOn] = useState(today());
  const [close, setClose] = useState({});
  const [autoRev, setAutoRev] = useState(true);
  const [newCur, setNewCur] = useState("USD");
  const [newRate, setNewRate] = useState("");
  const [newDate, setNewDate] = useState(today());
  const [selFY, setSelFY] = useState(getFY());
  const rates = getFxRates();
  const open = useMemo(() => getOpenFxInvoices(), [tick]);
  const rateFor = (c) => {
    const v = close[c] !== void 0 && close[c] !== "" ? parseFloat(close[c]) : rates[c] ? parseFloat(rates[c].rate) : 0;
    return v > 0 ? v : 0;
  };
  const rows = open.map((o) => {
    const cr = rateFor(o.cur);
    const reval = cr > 0 ? r2(o.fcOut * cr) : o.out;
    return { ...o, cr, reval, unreal: r2(reval - o.out) };
  });
  const curs = [...new Set(rows.map((r) => r.cur))];
  const byCur = curs.map((c) => {
    const rr = rows.filter((r) => r.cur === c);
    return { cur: c, fc: r2(rr.reduce((s, r) => s + r.fcOut, 0)), booked: r2(rr.reduce((s, r) => s + r.out, 0)), reval: r2(rr.reduce((s, r) => s + r.reval, 0)), unreal: r2(rr.reduce((s, r) => s + r.unreal, 0)), rate: rateFor(c) };
  });
  const totalUnreal = r2(byCur.reduce((s, c) => s + c.unreal, 0));
  const missing = curs.filter((c) => !(rateFor(c) > 0));
  const fyFrom = fyStartOf(selFY), fyTo = fyEndOf(selFY);
  const fxLines = useMemo(() => getAllLedgerLines().filter((l) => (l.account === "FX_GAIN" || l.account === "FX_LOSS") && (l.date || "") >= fyFrom && (l.date || "") <= fyTo).sort((a, b) => (b.date || "").localeCompare(a.date || "")), [tick, selFY]);
  const gainTot = r2(fxLines.reduce((s, l) => s + (l.account === "FX_GAIN" ? l.credit - l.debit : 0), 0)), lossTot = r2(fxLines.reduce((s, l) => s + (l.account === "FX_LOSS" ? l.debit - l.credit : 0), 0));
  const postReval = () => {
    if (missing.length) {
      toast.error("Enter the closing rate for " + missing.join(", "));
      return;
    }
    if (Math.abs(totalUnreal) < 5e-3) {
      toast.info("No difference to post");
      return;
    }
    const dup = getManualJournal().some((j) => j.referenceNo === "FX-REVAL" && j.date === asOn);
    if (dup && !window.confirm("A revaluation journal already exists for " + fmtDate(asOn) + ". Post another?")) return;
    const gain = totalUnreal > 0, amt = Math.abs(totalUnreal);
    const lines = gain ? [{ account: "TRADE_RECEIVABLE", desc: "Revalue foreign-currency receivables", debit: amt, credit: 0 }, { account: "FX_GAIN", desc: "Unrealised exchange gain", debit: 0, credit: amt }] : [{ account: "FX_LOSS", desc: "Unrealised exchange loss", debit: amt, credit: 0 }, { account: "TRADE_RECEIVABLE", desc: "Revalue foreign-currency receivables", debit: 0, credit: amt }];
    const jv = {
      id: newId("JV-"),
      date: asOn,
      narration: `Unrealised FX ${gain ? "gain" : "loss"} on open receivables \u2014 ${byCur.map((c) => `${c.cur} @ ${c.rate}`).join(", ")}`,
      referenceNo: "FX-REVAL",
      reportingMethod: "both",
      lines,
      voucherNo: nextVoucherNo(),
      txnRefNo: nextTxnRefNo(asOn),
      srcType: "JV",
      createdBy: (currentUser == null ? void 0 : currentUser.email) || ""
    };
    if (autoRev) jv.reverseDate = addDaysISO(asOn, 1);
    S.set(SK.JOURNAL, [...getManualJournal(), jv]);
    byCur.forEach((c) => saveFxRate(c.cur, c.rate, asOn));
    logAudit("FX_REVALUATION_POSTED", `${fmt(amt)} ${gain ? "gain" : "loss"} as on ${asOn}`, currentUser);
    bump();
    toast.success(`Revaluation ${gain ? "gain" : "loss"} of ${fmt(amt)} posted${autoRev ? " \u2014 auto-reverses next day" : ""}`);
  };
  const addRate = () => {
    const v = parseFloat(newRate);
    if (!(v > 0)) {
      toast.error("Enter a rate");
      return;
    }
    saveFxRate(newCur, v, newDate);
    setNewRate("");
    bump();
    toast.success("Rate saved");
  };
  const doExport = (f) => exportTableAs(
    f,
    "FX_Exposure",
    "Foreign-currency receivables",
    ["Invoice", "Customer", "Date", "Currency", "Outstanding (FC)", "Booked rate", "Booked (\u20B9)", "Closing rate", "Revalued (\u20B9)", "Unrealised gain/(loss)"],
    rows.map((r) => [r.invNo, r.party, fmtDate(r.date), r.cur, fmtN(r.fcOut), r.rate, fmtN(r.out), r.cr, fmtN(r.reval), fmtN(r.unreal)])
  );
  return /* @__PURE__ */ React.createElement(PageShell, null, /* @__PURE__ */ React.createElement(InfoNote, null, "Create an invoice in USD, EUR, GBP\u2026 from the invoice form (Currency + exchange rate). The ledger is kept in \u20B9 at the booking rate. When the customer pays, Bank Reconciliation books the difference between the \u20B9 received and the \u20B9 booked as ", /* @__PURE__ */ React.createElement("b", null, "Foreign Exchange Gain / Loss"), " automatically. At period end, revalue what is still open here."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Kpi, { label: "Open foreign invoices", value: String(open.length), sub: curs.join(", ") || "none" }), /* @__PURE__ */ React.createElement(Kpi, { label: "Booked value (\u20B9)", value: fmt(rows.reduce((s, r) => s + r.out, 0)) }), /* @__PURE__ */ React.createElement(Kpi, { label: "Unrealised gain / (loss)", value: fmt(totalUnreal), color: totalUnreal >= 0 ? "var(--green)" : "var(--red)", sub: "at the closing rates below" }), /* @__PURE__ */ React.createElement(Kpi, { label: `Realised FY ${selFY}-${String(selFY + 1).slice(2)}`, value: fmt(gainTot - lossTot), color: gainTot - lossTot >= 0 ? "var(--green)" : "var(--red)", sub: `gain ${fmt(gainTot)} \xB7 loss ${fmt(lossTot)}` })), /* @__PURE__ */ React.createElement(TabBar, { value: tab, onChange: setTab, tabs: [["exposure", "Exposure & revaluation"], ["rates", "Exchange rates"], ["realised", "Realised gain / loss"]] }), tab === "exposure" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Revalue as on"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: asOn, onChange: (e) => setAsOn(e.target.value) })), curs.map((c) => /* @__PURE__ */ React.createElement("div", { className: "field", key: c, style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Closing rate \u2014 \u20B9 per ", c), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", style: { width: 130 }, value: close[c] !== void 0 ? close[c] : rates[c] ? rates[c].rate : "", onChange: (e) => setClose((x) => ({ ...x, [c]: e.target.value })) }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement(ExportMenu, { onExport: doExport, disabled: !rows.length })), rows.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "No open foreign-currency invoices." }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Wrap, { min: 1e3 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Invoice"), /* @__PURE__ */ React.createElement("th", { style: th }, "Customer"), /* @__PURE__ */ React.createElement("th", { style: th }, "Date"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Outstanding (FC)"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Booked rate"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Booked \u20B9"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Closing rate"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Revalued \u20B9"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Unrealised")), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.invNo, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: { ...td, fontFamily: "monospace" } }, r.invNo), /* @__PURE__ */ React.createElement("td", { style: td }, r.party), /* @__PURE__ */ React.createElement("td", { style: td }, fmtDate(r.date)), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmtC(r.fcOut, r.cur)), /* @__PURE__ */ React.createElement("td", { style: tdR }, r.rate), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(r.out)), /* @__PURE__ */ React.createElement("td", { style: tdR }, r.cr || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: tdR }, fmt(r.reval)), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, fontWeight: 700, color: r.unreal >= 0 ? "var(--green)" : "var(--red)" } }, fmt(r.unreal)))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", gap: 6, alignItems: "center", fontSize: 12, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: autoRev, onChange: (e) => setAutoRev(e.target.checked) }), " Auto-reverse the next day (recommended \u2014 the real gain/loss is booked when the customer pays)"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: postReval, disabled: !rows.length }, "Post revaluation journal (", fmt(totalUnreal), ")")), missing.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--red)", marginTop: 6 } }, "Enter a closing rate for ", missing.join(", "), "."))), tab === "rates" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "Currency"), /* @__PURE__ */ React.createElement("select", { className: "field-input", value: newCur, onChange: (e) => setNewCur(e.target.value) }, FX_CURRENCIES.filter((c) => c.code !== "INR").map((c) => /* @__PURE__ */ React.createElement("option", { key: c.code, value: c.code }, c.code, " \u2014 ", c.name)))), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "\u20B9 per 1 unit"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "field-input", value: newRate, onChange: (e) => setNewRate(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "field", style: { marginBottom: 0 } }, /* @__PURE__ */ React.createElement("label", { className: "field-label" }, "As on"), /* @__PURE__ */ React.createElement("input", { type: "date", className: "field-input", value: newDate, onChange: (e) => setNewDate(e.target.value) })), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: addRate }, "Save rate")), Object.keys(rates).length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "No rates saved yet. They are remembered automatically whenever you save a foreign-currency invoice." }) : /* @__PURE__ */ React.createElement(Wrap, { min: 520 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Currency"), /* @__PURE__ */ React.createElement("th", { style: thR }, "\u20B9 per unit"), /* @__PURE__ */ React.createElement("th", { style: th }, "As on")), /* @__PURE__ */ React.createElement("tbody", null, Object.entries(rates).map(([c, v]) => /* @__PURE__ */ React.createElement("tr", { key: c, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, c, " \u2014 ", (FX_CURRENCIES.find((x) => x.code === c) || {}).name), /* @__PURE__ */ React.createElement("td", { style: tdR }, v.rate), /* @__PURE__ */ React.createElement("td", { style: td }, fmtDate(v.date))))))), tab === "realised" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement(FyPicker, { value: selFY, onChange: setSelFY })), fxLines.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { text: "No exchange gain or loss has been booked in this year." }) : /* @__PURE__ */ React.createElement(Wrap, { min: 760 }, /* @__PURE__ */ React.createElement(HeadRow, null, /* @__PURE__ */ React.createElement("th", { style: th }, "Date"), /* @__PURE__ */ React.createElement("th", { style: th }, "Narration"), /* @__PURE__ */ React.createElement("th", { style: th }, "Voucher"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Gain"), /* @__PURE__ */ React.createElement("th", { style: thR }, "Loss")), /* @__PURE__ */ React.createElement("tbody", null, fxLines.map((l, i) => /* @__PURE__ */ React.createElement("tr", { key: i, style: { borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("td", { style: td }, fmtDate(l.date)), /* @__PURE__ */ React.createElement("td", { style: td }, l.narration), /* @__PURE__ */ React.createElement("td", { style: { ...td, fontFamily: "monospace", fontSize: 11 } }, l.voucherNo), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, color: "var(--green)" } }, l.account === "FX_GAIN" ? fmt(l.credit - l.debit) : ""), /* @__PURE__ */ React.createElement("td", { style: { ...tdR, color: "var(--red)" } }, l.account === "FX_LOSS" ? fmt(l.debit - l.credit) : "")))))));
};
