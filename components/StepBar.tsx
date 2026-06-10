"use client";

interface Step {
  label: string;
  number: number;
}

const STEPS: Step[] = [
  { number: 1, label: "Select Student" },
  { number: 2, label: "Payment Details" },
  { number: 3, label: "Generate & Send" },
];

interface StepBarProps {
  currentStep: number;
}

export default function StepBar({ currentStep }: StepBarProps) {
  return (
    <div className="w-full bg-white border-b border-[#e2e8f0] px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted
                      ? "bg-[#15803d] text-white"
                      : isActive
                      ? "bg-[#2563eb] text-white"
                      : "bg-[#e2e8f0] text-[#94a3b8]"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? "text-[#2563eb]"
                      : isCompleted
                      ? "text-[#15803d]"
                      : "text-[#94a3b8]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all ${
                    currentStep > step.number ? "bg-[#15803d]" : "bg-[#e2e8f0]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
