"use client";

import { Student } from "@/types";

interface StudentBannerProps {
  student: Student;
  onClear?: () => void;
}

export default function StudentBanner({ student, onClear }: StudentBannerProps) {
  return (
    <div className="bg-[#1a3557] text-white rounded-xl px-5 py-4 flex items-center gap-4">
      <span className="font-mono text-sm bg-[#dbeafe] text-[#1d4ed8] px-3 py-1 rounded-full font-bold whitespace-nowrap">
        {student.fileNo}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base leading-tight">
          {student.surname}, {student.firstName}
        </p>
        <p className="text-sm text-blue-200 truncate">{student.school}</p>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-blue-300 hover:text-white transition-colors ml-2 flex-shrink-0 text-xs underline"
        >
          Change
        </button>
      )}
    </div>
  );
}
