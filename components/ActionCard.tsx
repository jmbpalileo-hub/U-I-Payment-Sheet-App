"use client";

import { ActionStatus } from "@/types";

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  status: ActionStatus;
  progressText?: string;
  errorMessage?: string;
  successLink?: { href: string; label: string };
  onAction: () => void;
  actionLabel: string;
}

export default function ActionCard({
  icon,
  title,
  description,
  status,
  progressText,
  errorMessage,
  successLink,
  onAction,
  actionLabel,
}: ActionCardProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
        isSuccess
          ? "border-[#bbf7d0]"
          : isError
          ? "border-[#fecaca]"
          : "border-[#e2e8f0]"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl leading-none mt-0.5">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-[#1e293b] text-sm">{title}</h3>
          <p className="text-xs text-[#64748b] mt-0.5">{description}</p>
        </div>
        {isSuccess && (
          <span className="flex-shrink-0 w-5 h-5 bg-[#15803d] rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>

      {isLoading && progressText && (
        <p className="text-xs text-[#64748b] mb-2 flex items-center gap-1.5">
          <svg className="w-3 h-3 animate-spin text-[#2563eb]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {progressText}
        </p>
      )}

      {isError && errorMessage && (
        <p className="text-xs text-[#dc2626] mb-2 bg-[#fee2e2] px-3 py-2 rounded">{errorMessage}</p>
      )}

      {isSuccess && successLink && (
        <a
          href={successLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#2563eb] hover:underline flex items-center gap-1 mb-2"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {successLink.label}
        </a>
      )}

      <button
        onClick={onAction}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
          isSuccess
            ? "bg-[#dcfce7] text-[#15803d] cursor-default"
            : isLoading
            ? "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
            : isError
            ? "bg-[#dc2626] text-white hover:bg-[#b91c1c]"
            : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af]"
        }`}
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing…
          </>
        ) : isSuccess ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Done
          </>
        ) : isError ? (
          "Retry"
        ) : (
          actionLabel
        )}
      </button>
    </div>
  );
}
