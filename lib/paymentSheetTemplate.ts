import { PaymentSheetParams } from "@/types";
import { formatCurrency, todayDDMMYYYY } from "./formatters";

export function renderPaymentSheetHTML(p: PaymentSheetParams): string {
  const staffInitial = p.staffInitial || process.env.STAFF_INITIAL || "JMP";
  const generated = todayDDMMYYYY();

  const cashMap: Record<string, number> = {
    Cash: 0,
    "C/Card": 0,
    EFTPOS: 0,
    DD: 0,
    CCCF: 0,
    CHQ: 0,
  };
  if (p.paymentType && cashMap[p.paymentType] !== undefined) {
    cashMap[p.paymentType] = Number(p.amountReceive) || 0;
  }

  const checklistItems = [
    { label: "Letter of Offer / Invoice", checked: true },
    { label: "Payment Plan", checked: true },
    { label: "Proof of Payment", checked: true },
    { label: "Consultation Sheet", checked: true },
    { label: "Others: ___________", checked: false },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Payment Sheet - ${p.fileNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; padding: 10mm; }
  .page { max-width: 190mm; margin: 0 auto; }

  .title-box {
    border: 2px solid #000;
    text-align: center;
    padding: 8px;
    margin-bottom: 10px;
    background: #1a3557;
    color: #fff;
  }
  .title-box h1 { font-size: 16px; font-weight: bold; letter-spacing: 0.05em; }
  .title-box p { font-size: 11px; margin-top: 2px; }

  .header-row {
    display: flex;
    gap: 0;
    border: 1px solid #000;
    border-bottom: none;
  }
  .header-cell {
    flex: 1;
    padding: 4px 6px;
    border-right: 1px solid #000;
    font-size: 10px;
  }
  .header-cell:last-child { border-right: none; }
  .header-cell .label { font-weight: bold; font-size: 9px; color: #444; }
  .header-cell .value { font-size: 11px; font-weight: bold; }

  table { width: 100%; border-collapse: collapse; }
  th, td {
    border: 1px solid #000;
    padding: 4px 6px;
    font-size: 10px;
    text-align: left;
  }
  th {
    background: #1a3557;
    color: #fff;
    font-size: 9px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  td { font-size: 11px; }

  .footer-row {
    border: 1px solid #000;
    border-top: none;
    padding: 5px 6px;
    display: flex;
    gap: 30px;
    font-size: 10px;
  }
  .footer-row span { font-weight: bold; }

  .divider { height: 12px; }

  .two-col { display: flex; gap: 15px; }
  .col-left { flex: 1; }
  .col-right { flex: 1; }

  .section-title {
    font-weight: bold;
    font-size: 11px;
    background: #1a3557;
    color: #fff;
    padding: 4px 6px;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cash-row {
    display: flex;
    justify-content: space-between;
    padding: 3px 6px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 11px;
  }
  .cash-row.total {
    border-top: 2px solid #000;
    font-weight: bold;
    background: #f3f4f6;
  }
  .cash-box { border: 1px solid #000; margin-bottom: 8px; }

  .deposit-box { border: 1px solid #000; padding: 6px; margin-bottom: 8px; }
  .deposit-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 11px; }
  .deposit-row .label { font-weight: bold; }

  .sig-box { border: 1px solid #000; padding: 6px; }
  .sig-row { padding: 4px 0; border-bottom: 1px solid #ddd; font-size: 11px; }
  .sig-row:last-child { border-bottom: none; }

  .checklist-box { border: 1px solid #000; padding: 6px; margin-bottom: 8px; }
  .checklist-item { padding: 3px 0; font-size: 11px; }

  .student-info-box { border: 1px solid #000; padding: 6px; }
  .info-row { display: flex; gap: 8px; padding: 2px 0; font-size: 11px; border-bottom: 1px solid #eee; }
  .info-row:last-child { border-bottom: none; }
  .info-row .label { font-weight: bold; min-width: 80px; }

  .page-footer {
    margin-top: 12px;
    text-align: center;
    font-size: 9px;
    color: #666;
    border-top: 1px solid #ddd;
    padding-top: 6px;
  }

  @media print {
    body { padding: 0; }
    .page { max-width: 100%; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Title -->
  <div class="title-box">
    <h1>PAYMENT SHEET</h1>
    <p>U&amp;I EDUCATION BRISBANE</p>
  </div>

  <!-- Header row: name, VTO, initial -->
  <div class="header-row">
    <div class="header-cell">
      <div class="label">FAMILY NAME</div>
      <div class="value">${p.surname}</div>
    </div>
    <div class="header-cell">
      <div class="label">GIVEN NAME</div>
      <div class="value">${p.firstName}</div>
    </div>
    <div class="header-cell">
      <div class="label">VTO NO.</div>
      <div class="value">${p.vtoNo || "—"}</div>
    </div>
    <div class="header-cell" style="flex:0.5">
      <div class="label">INITIAL</div>
      <div class="value">${staffInitial}</div>
    </div>
  </div>

  <!-- Payment register table -->
  <table>
    <thead>
      <tr>
        <th>Pay Receive Date</th>
        <th>Pay Register Date</th>
        <th>School</th>
        <th>File No.</th>
        <th>Tuition Fee</th>
        <th>Amount Received</th>
        <th>Type</th>
        <th>Receipt No.</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${p.paymentReceiveDate}</td>
        <td>${p.paymentRegisterDate}</td>
        <td>${p.school}</td>
        <td style="font-family:monospace;font-weight:bold">${p.fileNo}</td>
        <td>${formatCurrency(p.tuitionFeeAmount)}</td>
        <td style="font-weight:bold">${formatCurrency(p.amountReceive)}</td>
        <td>${p.paymentType}</td>
        <td>${p.receiptNo || "—"}</td>
        <td>${formatCurrency(p.balance)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Footer row -->
  <div class="footer-row">
    <div>PAYMENT NO.: <span>${p.paymentNo || "—"}</span></div>
    <div>PAYMENT DUE DATE: <span>${p.paymentDueDate || "—"}</span></div>
    <div>COMMENT: <span>${p.comment || "—"}</span></div>
  </div>

  <div class="divider"></div>

  <!-- Two column section -->
  <div class="two-col">

    <!-- Left: Cash Book Summary -->
    <div class="col-left">
      <div class="section-title">Cash Book Summary</div>
      <div class="cash-box">
        <div class="cash-row"><span>CASH:</span><span>${formatCurrency(cashMap["Cash"])}</span></div>
        <div class="cash-row"><span>C/CARD:</span><span>${formatCurrency(cashMap["C/Card"])}</span></div>
        <div class="cash-row"><span>EFTPOS:</span><span>${formatCurrency(cashMap["EFTPOS"])}</span></div>
        <div class="cash-row"><span>D/D:</span><span>${formatCurrency(cashMap["DD"])}</span></div>
        <div class="cash-row"><span>CCCF:</span><span>${formatCurrency(cashMap["CCCF"])}</span></div>
        <div class="cash-row"><span>CHQ:</span><span>${formatCurrency(cashMap["CHQ"])}</span></div>
        <div class="cash-row total"><span>TOTAL:</span><span>${formatCurrency(p.amountReceive)}</span></div>
      </div>

      <div class="deposit-box">
        <div class="deposit-row"><span class="label">DEPOSIT DATE:</span><span>${p.paymentRegisterDate}</span></div>
        <div class="deposit-row"><span class="label">DEPOSIT AMOUNT:</span><span>${formatCurrency(p.amountReceive)}</span></div>
      </div>

      <div class="sig-box">
        <div class="sig-row">ACCOUNTS SIG.: ___________________</div>
        <div class="sig-row">MANAGER SIG.: ____________________</div>
      </div>
    </div>

    <!-- Right: Checklist + Student Info -->
    <div class="col-right">
      <div class="section-title">Checklist</div>
      <div class="checklist-box">
        ${checklistItems.map(item => `
        <div class="checklist-item">${item.checked ? "☑" : "☐"} ${item.label}</div>
        `).join("")}
      </div>

      <div class="section-title">Student Information</div>
      <div class="student-info-box">
        <div class="info-row"><span class="label">FILE NO.:</span><span style="font-family:monospace">${p.fileNo}</span></div>
        <div class="info-row"><span class="label">SCHOOL:</span><span>${p.school}</span></div>
        <div class="info-row"><span class="label">DOB:</span><span>${p.dob || "—"}</span></div>
        <div class="info-row"><span class="label">CONTACT NO.:</span><span>${p.contactNo || "—"}</span></div>
        <div class="info-row"><span class="label">COURSE:</span><span>${p.course || "—"}</span></div>
      </div>
    </div>

  </div>

  <!-- Page footer -->
  <div class="page-footer">
    Generated: ${generated} &nbsp;|&nbsp; Staff: ${staffInitial} &nbsp;|&nbsp; U&amp;I Education Brisbane
  </div>

</div>
</body>
</html>`;
}
