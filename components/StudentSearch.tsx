"use client";

import { useState, useEffect, useRef } from "react";
import { Student } from "@/types";

interface StudentSearchProps {
  onSelect: (student: Student) => void;
}

export default function StudentSearch({ onSelect }: StudentSearchProps) {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          setError(data.error || "Failed to load students");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error loading students");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setFiltered([]);
      return;
    }
    const results = students.filter(
      (s) =>
        s.fileNo.toLowerCase().includes(q) ||
        s.surname.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q)
    );
    setFiltered(results.slice(0, 50));
  }, [query, students]);

  const highlight = (text: string, q: string) => {
    if (!q || q.length < 2) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-inherit rounded-sm px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const q = query.trim().toLowerCase();

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
      <h2 className="text-lg font-semibold text-[#1a3557] mb-1">Find Student</h2>
      <p className="text-sm text-[#64748b] mb-4">
        Search by name, file number, or school. Type at least 2 characters.
      </p>

      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7 7 0 1116.65 16.65z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-9 pr-4 py-2.5 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Status line */}
      <div className="text-xs text-[#94a3b8] mb-3">
        {loading ? (
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading student register…
          </span>
        ) : error ? (
          <span className="text-[#dc2626]">{error}</span>
        ) : (
          <span>
            {students.length} students loaded
            {q.length >= 2 ? ` · ${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : " · type to search"}
          </span>
        )}
      </div>

      {/* Results */}
      {q.length >= 2 && filtered.length > 0 && (
        <div className="border border-[#e2e8f0] rounded-lg overflow-hidden divide-y divide-[#f1f5f9]">
          {filtered.map((s) => (
            <button
              key={s.fileNo}
              onClick={() => onSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-[#f1f5f9] active:bg-[#dbeafe] transition-colors group flex items-center gap-3"
            >
              <span className="inline-block font-mono text-xs bg-[#dbeafe] text-[#1d4ed8] px-2 py-0.5 rounded-full whitespace-nowrap">
                {highlight(s.fileNo, q)}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[#1e293b]">
                  {highlight(s.surname, q)}, {highlight(s.firstName, q)}
                </span>
                <span className="ml-2 text-xs text-[#64748b] truncate">
                  · {highlight(s.school, q)}
                </span>
              </div>
              <svg
                className="w-4 h-4 text-[#94a3b8] group-hover:text-[#2563eb] flex-shrink-0 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {q.length >= 2 && filtered.length === 0 && !loading && (
        <div className="text-center py-8 text-[#94a3b8] text-sm">
          No students match &ldquo;{query}&rdquo;
        </div>
      )}

      {q.length > 0 && q.length < 2 && (
        <div className="text-center py-4 text-[#94a3b8] text-xs">
          Type at least 2 characters to search
        </div>
      )}
    </div>
  );
}
