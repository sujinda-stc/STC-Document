// ตรรกะสถานะ/สรุปข้อมูล — ต้องตรงกับฝั่งหน้าเว็บ (index.html) เป๊ะๆ
// ใช้ร่วมกันโดยทุกฟังก์ชันใน netlify/functions/

const TOTAL_CHECKLIST_ITEMS = 20;

function docItemDonePct(it) {
  if (!it.sentDate) return 0;
  if (it.hasReply && !it.replyDate) return 50;
  return 100;
}

function permitItemDonePct(it) {
  if (!it.sentDate) return 0;
  if (!it.permitDate) return 50;
  return 100;
}

function purchaseItemDonePct(it) {
  const prOthQty = Number(it.prOthQty) || 0;
  if (prOthQty > 0) return 100;
  const poNo = (it.poNo || '').toString().trim();
  if (!poNo) return 0;
  const poQty = Number(it.poQty) || 0;
  const poReceive = Number(it.poReceive) || 0;
  const complete = poQty > 0 ? poReceive >= poQty : poReceive > 0;
  return complete ? 100 : 50;
}

function summarizeItems(items, pctFn) {
  if (!items.length) return { total: 0, done: 0, waiting: 0, pending: 0, pct: null };
  let sum = 0, done = 0, waiting = 0, pending = 0;
  items.forEach((it) => {
    const pct = pctFn(it);
    sum += pct;
    if (pct === 100) done++;
    else if (pct === 50) waiting++;
    else pending++;
  });
  return { total: items.length, done, waiting, pending, pct: Math.round(sum / items.length) };
}

/** สร้างสรุปเบาๆ (ไม่มีรายการละเอียด) ของโครงการหนึ่งโครงการ — ใช้ทำหน้าภาพรวมทุกโครงการ */
function buildSummary(project) {
  const docItems = [];
  (project.documentCategories || []).forEach((c) => docItems.push(...(c.items || [])));
  const permitItems = [];
  (project.permitAgencies || []).forEach((a) => permitItems.push(...(a.items || [])));
  const purchaseItems = project.purchases || [];

  const pendingMoney = [];
  (project.permitAgencies || []).forEach((a) => {
    if (a.agencyType === 'local_admin') return; // ไม่มีฟิลด์งวด/ยอดเงิน
    (a.items || []).forEach((it) => {
      if (permitItemDonePct(it) === 100) return;
      pendingMoney.push({
        agency: a.agencyLabel,
        idLabel: it.road || it.orgName || it.localName || '',
        installment: it.installment || '-',
        amount: it.amount
      });
    });
  });

  const checklistDone = (project.checklist || []).filter((c) => c.status === 'มี' || c.status === 'ไม่มี').length;

  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    budget: project.budget,
    manualPct: project.manualPct,
    doc: summarizeItems(docItems, docItemDonePct),
    permit: summarizeItems(permitItems, permitItemDonePct),
    purchase: summarizeItems(purchaseItems, purchaseItemDonePct),
    checklist: {
      total: TOTAL_CHECKLIST_ITEMS,
      done: checklistDone,
      waiting: 0,
      pending: TOTAL_CHECKLIST_ITEMS - checklistDone,
      pct: Math.round((checklistDone / TOTAL_CHECKLIST_ITEMS) * 100)
    },
    pendingMoney
  };
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

module.exports = { buildSummary, jsonResponse };
