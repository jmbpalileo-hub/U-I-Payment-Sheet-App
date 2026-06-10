export function todayDDMMYYYY(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

export function ddmmyyyyToDisplayDate(ddmmyyyy: string): string {
  return ddmmyyyy; // already in DD/MM/YYYY format
}

// Strips slashes from DD/MM/YYYY → DDMMYYYY
export function stripSlashes(dateStr: string): string {
  return dateStr.replace(/\//g, "");
}

export function buildScreenshotFilename(
  paymentReceiveDate: string,
  surname: string,
  firstName: string,
  ext: string
): string {
  const dateStr = stripSlashes(paymentReceiveDate);
  return `${dateStr} - ${surname}, ${firstName} - Payment Confirmation.${ext}`;
}

export function buildPaymentSheetFilename(
  paymentReceiveDate: string,
  surname: string,
  firstName: string,
  paymentType: string
): string {
  const dateStr = stripSlashes(paymentReceiveDate);
  return `Payment Sheet - ${dateStr} - ${surname} ${firstName} - ${paymentType}.pdf`;
}

export function buildEmailSubject(
  paymentReceiveDate: string,
  firstName: string,
  surname: string,
  paymentType: string
): string {
  const dateStr = stripSlashes(paymentReceiveDate);
  return `Payment Sheet - ${dateStr} - ${firstName} ${surname} - ${paymentType}`;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00";
  return `$${Number(amount).toFixed(2)}`;
}
