"use client";

import { useState, useRef, useCallback } from "react";
import { buildScreenshotFilename } from "@/lib/formatters";

interface ScreenshotUploadProps {
  paymentReceiveDate: string;
  surname: string;
  firstName: string;
  onFileSelected: (file: File | null) => void;
  selectedFile: File | null;
}

export default function ScreenshotUpload({
  paymentReceiveDate,
  surname,
  firstName,
  onFileSelected,
  selectedFile,
}: ScreenshotUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getExt = (file: File) => {
    if (file.type === "application/pdf") return "pdf";
    const parts = file.name.split(".");
    return parts[parts.length - 1].toLowerCase() || "jpg";
  };

  const handleFile = useCallback(
    (file: File) => {
      onFileSelected(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      } else {
        setPreview(null);
      }
    },
    [onFileSelected]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const remove = () => {
    onFileSelected(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const newName = selectedFile
    ? buildScreenshotFilename(paymentReceiveDate, surname, firstName, getExt(selectedFile))
    : null;

  const downloadRenamed = () => {
    if (!selectedFile || !newName) return;
    const url = URL.createObjectURL(selectedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = newName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedFile) {
    const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
    const sizeKB = (selectedFile.size / 1024).toFixed(0);
    const sizeLabel = selectedFile.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

    return (
      <div className="border border-[#e2e8f0] rounded-lg p-4 bg-[#f8fafc]">
        <div className="flex items-start gap-3">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded border border-[#e2e8f0] flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-[#fef3c7] rounded border border-[#fcd34d] flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-[#b45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#64748b] truncate">{selectedFile.name}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{sizeLabel}</p>
            {newName && (
              <div className="mt-2 p-2 bg-[#dbeafe] rounded text-xs text-[#1d4ed8] font-mono leading-snug">
                <span className="font-sans text-[#1e40af] font-semibold mr-1">→</span>
                {newName}
              </div>
            )}
          </div>

          <button
            onClick={remove}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fee2e2] text-[#dc2626] flex items-center justify-center hover:bg-[#fecaca] transition-colors"
            title="Remove"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {newName && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={downloadRenamed}
              className="text-xs text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 underline"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download renamed file
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
        dragging
          ? "border-[#2563eb] bg-[#dbeafe]"
          : "border-[#cbd5e1] bg-[#f8fafc] hover:border-[#2563eb] hover:bg-[#f0f7ff]"
      }`}
    >
      <svg
        className="w-8 h-8 mx-auto text-[#94a3b8] mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm text-[#475569] font-medium">
        Drop payment screenshot here or <span className="text-[#2563eb]">browse</span>
      </p>
      <p className="text-xs text-[#94a3b8] mt-1">PNG, JPEG, or PDF · PDF max 10 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
