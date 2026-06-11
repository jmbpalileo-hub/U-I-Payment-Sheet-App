"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Student, PaymentFormData, ActionState, PaymentSheetParams } from "@/types";
import { stripSlashes, buildEmailSubject } from "@/lib/formatters";
import StepBar from "@/components/StepBar";
import StudentSearch from "@/components/StudentSearch";
import StudentBanner from "@/components/StudentBanner";
import PaymentForm, { DEFAULT_FORM } from "@/components/PaymentForm";
import ScreenshotUpload from "@/components/ScreenshotUpload";
import ActionCard from "@/components/ActionCard";

const initialActions = (): Record<string, ActionState> => ({
  print: { status: "idle" },
  uploadSheet: { status: "idle" },
  uploadScreenshot: { status: "idle" },
  createDraft: { status: "idle" },
});

export default function Home() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [student, setStudent] = useState<Student | null>(null);
  const [initialFileNo, setInitialFileNo] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fileNo = params.get("fileNo");
    if (fileNo) setInitialFileNo(fileNo);
  }, []);
  const [form, setForm] = useState<PaymentFormData>(DEFAULT_FORM);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [actions, setActions] = useState(initialActions());
  const [draftWarning, setDraftWarning] = useState(false);

  const setAction = (key: string, update: Partial<ActionState>) =>
    setActions((prev) => ({ ...prev, [key]: { ...prev[key], ...update } }));

  const handleSelectStudent = (s: Student) => {
    setStudent(s);
    setStep(2);
  };

  const handleFormSubmit = () => setStep(3);

  const handleReset = () => {
    setStep(1);
    setStudent(null);
    setForm(DEFAULT_FORM);
    setScreenshot(null);
    setActions(initialActions());
    setDraftWarning(false);
  };

  const buildSheetParams = useCallback((): PaymentSheetParams => ({
    ...form,
    fileNo: student!.fileNo,
    school: student!.school,
    surname: student!.surname,
    firstName: student!.firstName,
    staffInitial: process.env.NEXT_PUBLIC_STAFF_INITIAL || "JMP",
  }), [form, student]);

  const handlePrint = () => {
    const params = buildSheetParams();
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v ?? "")]))
    ).toString();
    window.open(`/api/payment-sheet/preview?${qs}`, "_blank");
    setAction("print", { status: "success" });
  };

  const handleUploadSheet = async () => {
    setAction("uploadSheet", { status: "loading", progressText: "Generating PDF…" });
    try {
      const res = await fetch("/api/upload/payment-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSheetParams()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAction("uploadSheet", { status: "success", result: data, message: data.fallbackMessage });
    } catch (err: unknown) {
      setAction("uploadSheet", {
        status: "error",
        errorMessage: err instanceof Error ? err.message : "Upload failed",
      });
    }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshot) {
      setAction("uploadScreenshot", {
        status: "error",
        errorMessage: "No screenshot selected — go back to Step 2 and add one.",
      });
      return;
    }
    setAction("uploadScreenshot", { status: "loading", progressText: "Finding student folder…" });
    try {
      const fd = new FormData();
      fd.append("file", screenshot);
      fd.append("fileNo", student!.fileNo);
      fd.append("paymentDate", form.paymentReceiveDate);
      fd.append("surname", student!.surname);
      fd.append("firstName", student!.firstName);
      setAction("uploadScreenshot", { status: "loading", progressText: "Uploading to Drive…" });
      const res = await fetch("/api/upload/screenshot", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAction("uploadScreenshot", { status: "success", result: data, message: data.fallbackMessage });
    } catch (err: unknown) {
      setAction("uploadScreenshot", {
        status: "error",
        errorMessage: err instanceof Error ? err.message : "Upload failed",
      });
    }
  };

  const handleCreateDraft = async () => {
    setAction("createDraft", { status: "loading", progressText: "Creating Gmail draft…" });
    try {
      const fullName = `${student!.firstName} ${student!.surname}`;
      const res = await fetch("/api/gmail/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          paymentDate: stripSlashes(form.paymentReceiveDate),
          paymentType: form.paymentType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Draft creation failed");
      setDraftWarning(true);
      setAction("createDraft", { status: "success", result: data });
    } catch (err: unknown) {
      setAction("createDraft", {
        status: "error",
        errorMessage: err instanceof Error ? err.message : "Draft creation failed",
      });
    }
  };

  const anySuccess = Object.values(actions).some((a) => a.status === "success");

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#64748b]">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
        <header className="bg-gradient-to-r from-[#1a3557] to-[#1e4db7] text-white px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="bg-white px-3 py-1 rounded">
              <span className="text-[#1a3557] font-bold text-lg tracking-widest">U&I</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Payment Sheet Generator</h1>
              <p className="text-blue-200 text-xs">U&I Education Brisbane</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-[#dbeafe] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1a3557] mb-2">Sign in required</h2>
            <p className="text-sm text-[#64748b] mb-6">
              Sign in with your U&I Google account to access the payment sheet generator.
            </p>
            <button
              onClick={() => signIn("google")}
              className="w-full py-3 px-4 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      <header className="bg-gradient-to-r from-[#1a3557] to-[#1e4db7] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white px-3 py-1 rounded">
              <span className="text-[#1a3557] font-bold text-lg tracking-widest">U&I</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Payment Sheet Generator</h1>
              <p className="text-blue-200 text-xs">U&I Education Brisbane</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full border-2 border-white/30" />
            )}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{session.user?.name}</p>
              <p className="text-blue-200 text-xs">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-blue-200 hover:text-white text-xs underline ml-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <StepBar currentStep={step} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-4">

        {step === 1 && <StudentSearch onSelect={handleSelectStudent} initialFileNo={initialFileNo} />}

        {step === 2 && student && (
          <>
            <StudentBanner student={student} onClear={() => { setStep(1); setStudent(null); }} />
            <PaymentForm
              value={form}
              onChange={setForm}
              onSubmit={handleFormSubmit}
              screenshotSlot={
                <ScreenshotUpload
                  paymentReceiveDate={form.paymentReceiveDate}
                  surname={student.surname}
                  firstName={student.firstName}
                  selectedFile={screenshot}
                  onFileSelected={setScreenshot}
                />
              }
            />
          </>
        )}

        {step === 3 && student && (
          <>
            <StudentBanner student={student} />

            {/* Summary card */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5">
              <h2 className="text-base font-semibold text-[#1a3557] mb-4">Payment Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Payment Date", value: form.paymentReceiveDate },
                  { label: "Amount Received", value: `$${Number(form.amountReceive).toFixed(2)}` },
                  { label: "Payment Type", value: form.paymentType },
                  { label: "Tuition Fee", value: `$${Number(form.tuitionFeeAmount).toFixed(2)}` },
                  { label: "Balance", value: form.balance != null ? `$${Number(form.balance).toFixed(2)}` : "—" },
                  { label: "Receipt No.", value: form.receiptNo || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#f8fafc] rounded-lg px-3 py-2.5">
                    <p className="text-xs text-[#94a3b8] uppercase tracking-wide font-medium">{label}</p>
                    <p className="text-sm font-semibold text-[#1e293b] mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[#f0f9ff] rounded-lg border border-[#bae6fd]">
                <p className="text-xs text-[#0369a1] font-semibold mb-1">Email Subject Preview</p>
                <p className="text-sm font-mono text-[#0c4a6e] break-all">
                  {buildEmailSubject(form.paymentReceiveDate, student.firstName, student.surname, form.paymentType)}
                </p>
              </div>
            </div>

            {draftWarning && (
              <div className="bg-[#fffbeb] border border-[#fcd34d] rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-[#92400e]">Reminder: Attach files before sending</p>
                  <p className="text-xs text-[#78350f] mt-0.5">
                    The draft has been created in Gmail. Before sending, attach the payment sheet PDF and proof of payment from Drive.
                  </p>
                  <a href="https://mail.google.com/mail/#drafts" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#2563eb] underline mt-1 inline-block">
                    Open Gmail Drafts →
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard
                icon="🖨️"
                title="Print / Save as PDF"
                description="Opens the payment sheet in a new tab for browser printing or Save as PDF."
                status={actions.print.status}
                progressText={actions.print.progressText}
                errorMessage={actions.print.errorMessage}
                onAction={handlePrint}
                actionLabel="Open Print Preview"
              />
              <ActionCard
                icon="☁️"
                title="Upload Payment Sheet"
                description="Generates a PDF and uploads it to the student's Drive folder."
                status={actions.uploadSheet.status}
                progressText={actions.uploadSheet.progressText}
                errorMessage={actions.uploadSheet.errorMessage}
                successLink={
                  actions.uploadSheet.result && "driveUrl" in actions.uploadSheet.result
                    ? { href: actions.uploadSheet.result.driveUrl, label: "Open in Drive" }
                    : undefined
                }
                onAction={handleUploadSheet}
                actionLabel="Upload to Drive"
              />
              <ActionCard
                icon="📸"
                title="Upload Payment Screenshot"
                description={screenshot ? `Will upload: ${screenshot.name}` : "No screenshot selected — go back to Step 2."}
                status={actions.uploadScreenshot.status}
                progressText={actions.uploadScreenshot.progressText}
                errorMessage={actions.uploadScreenshot.errorMessage}
                successLink={
                  actions.uploadScreenshot.result && "driveUrl" in actions.uploadScreenshot.result
                    ? { href: actions.uploadScreenshot.result.driveUrl, label: "Open in Drive" }
                    : undefined
                }
                onAction={handleUploadScreenshot}
                actionLabel="Upload Screenshot"
              />
              <ActionCard
                icon="✉️"
                title="Create Gmail Draft"
                description="Creates a draft to accounts@uandiedu.com with the standard template."
                status={actions.createDraft.status}
                progressText={actions.createDraft.progressText}
                errorMessage={actions.createDraft.errorMessage}
                successLink={{ href: "https://mail.google.com/mail/#drafts", label: "Open Gmail Drafts" }}
                onAction={handleCreateDraft}
                actionLabel="Create Draft"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-[#64748b] hover:text-[#1e293b] flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Payment Details
              </button>
              {anySuccess && (
                <button
                  onClick={handleReset}
                  className="px-5 py-2 bg-[#1a3557] text-white rounded-lg text-sm font-semibold hover:bg-[#1e4db7] transition-colors"
                >
                  Process Another Payment
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
