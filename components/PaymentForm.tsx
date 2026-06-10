"use client";

import { PaymentFormData, PaymentType } from "@/types";
import { todayDDMMYYYY } from "@/lib/formatters";

const PAYMENT_TYPES: PaymentType[] = ["DD", "EFTPOS", "CCCF", "Cash", "CHQ", "C/Card"];

const DEFAULT_FORM: PaymentFormData = {
  paymentReceiveDate: "",
  paymentRegisterDate: todayDDMMYYYY(),
  tuitionFeeAmount: 0,
  amountReceive: 0,
  paymentType: "DD",
  balance: null,
  receiptNo: "",
  vtoNo: "",
  paymentNo: "",
  paymentDueDate: "",
  dob: "",
  contactNo: "",
  course: "",
  comment: "",
};

interface PaymentFormProps {
  value: PaymentFormData;
  onChange: (data: PaymentFormData) => void;
  screenshotSlot?: React.ReactNode;
  onSubmit: () => void;
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wide mb-1">
        {label}
        {required && <span className="text-[#dc2626] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#94a3b8] mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent";

export { DEFAULT_FORM };

export default function PaymentForm({ value, onChange, screenshotSlot, onSubmit }: PaymentFormProps) {
  const set = <K extends keyof PaymentFormData>(key: K, val: PaymentFormData[K]) => {
    onChange({ ...value, [key]: val });
  };

  // Convert HTML date input (YYYY-MM-DD) to DD/MM/YYYY
  const fromDateInput = (v: string) => {
    if (!v) return "";
    const [y, m, d] = v.split("-");
    return `${d}/${m}/${y}`;
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for input
  const toDateInput = (v: string) => {
    if (!v || !v.includes("/")) return "";
    const [d, m, y] = v.split("/");
    return `${y}-${m}-${d}`;
  };

  const isValid = value.paymentReceiveDate && value.paymentRegisterDate && value.amountReceive > 0;

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
      <h2 className="text-lg font-semibold text-[#1a3557] mb-5">Payment Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Required fields */}
        <Field label="Payment Receive Date" required>
          <input
            type="date"
            className={inputCls}
            value={toDateInput(value.paymentReceiveDate)}
            onChange={(e) => set("paymentReceiveDate", fromDateInput(e.target.value))}
          />
        </Field>

        <Field label="Payment Register Date" required>
          <input
            type="date"
            className={inputCls}
            value={toDateInput(value.paymentRegisterDate)}
            onChange={(e) => set("paymentRegisterDate", fromDateInput(e.target.value))}
          />
        </Field>

        <Field label="Tuition Fee Amount" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputCls} pl-7`}
              value={value.tuitionFeeAmount || ""}
              onChange={(e) => set("tuitionFeeAmount", parseFloat(e.target.value) || 0)}
            />
          </div>
        </Field>

        <Field label="Amount Received" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputCls} pl-7`}
              value={value.amountReceive || ""}
              onChange={(e) => set("amountReceive", parseFloat(e.target.value) || 0)}
            />
          </div>
        </Field>

        <Field label="Payment Type" required>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_TYPES.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => set("paymentType", pt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  value.paymentType === pt
                    ? "bg-[#2563eb] text-white border-[#2563eb]"
                    : "bg-white text-[#475569] border-[#e2e8f0] hover:border-[#2563eb] hover:text-[#2563eb]"
                }`}
              >
                {pt}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Balance">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`${inputCls} pl-7`}
              value={value.balance ?? ""}
              onChange={(e) =>
                set("balance", e.target.value === "" ? null : parseFloat(e.target.value))
              }
            />
          </div>
        </Field>

        <Field label="Receipt No.">
          <input
            type="text"
            className={inputCls}
            value={value.receiptNo}
            onChange={(e) => set("receiptNo", e.target.value)}
          />
        </Field>

        <Field label="VTO No.">
          <input
            type="text"
            className={inputCls}
            value={value.vtoNo}
            onChange={(e) => set("vtoNo", e.target.value)}
          />
        </Field>

        <Field label="Payment No.">
          <input
            type="text"
            className={inputCls}
            value={value.paymentNo}
            onChange={(e) => set("paymentNo", e.target.value)}
          />
        </Field>

        <Field label="Payment Due Date">
          <input
            type="date"
            className={inputCls}
            value={toDateInput(value.paymentDueDate)}
            onChange={(e) => set("paymentDueDate", fromDateInput(e.target.value))}
          />
        </Field>

        <Field label="Date of Birth">
          <input
            type="date"
            className={inputCls}
            value={toDateInput(value.dob)}
            onChange={(e) => set("dob", fromDateInput(e.target.value))}
          />
        </Field>

        <Field label="Contact No.">
          <input
            type="tel"
            className={inputCls}
            value={value.contactNo}
            onChange={(e) => set("contactNo", e.target.value)}
          />
        </Field>

        <Field label="Course" hint="e.g. Diploma of Business">
          <input
            type="text"
            className={inputCls}
            value={value.course}
            onChange={(e) => set("course", e.target.value)}
          />
        </Field>

        <Field label="Comment" hint="e.g. scholarship applied">
          <input
            type="text"
            className={inputCls}
            value={value.comment}
            onChange={(e) => set("comment", e.target.value)}
          />
        </Field>
      </div>

      {/* Screenshot upload slot */}
      {screenshotSlot && (
        <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
          <h3 className="text-sm font-semibold text-[#475569] uppercase tracking-wide mb-3">
            Payment Screenshot
          </h3>
          {screenshotSlot}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
            isValid
              ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af]"
              : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
          }`}
        >
          Review &amp; Generate
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
