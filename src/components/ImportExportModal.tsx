"use client";

import { useState, useRef, useCallback } from "react";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportError {
  filename: string;
  error: string;
}

interface ImportResult {
  imported: number;
  errors: ImportError[];
}

type ImportStatus = "idle" | "uploading" | "complete" | "error";
type ExportStatus = "idle" | "generating" | "complete" | "error";
type Tab = "import" | "export";

export function ImportExportModal({ isOpen, onClose }: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("import");

  // Import state
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [includeBacklinks, setIncludeBacklinks] = useState(false);

  const resetState = useCallback(() => {
    setImportStatus("idle");
    setImportResult(null);
    setExportStatus("idle");
    setDragActive(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setImportStatus("uploading");
    setImportResult(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const result: ImportResult = await response.json();
      setImportResult(result);
      setImportStatus("complete");
    } catch (error) {
      console.error("Import error:", error);
      setImportResult({
        imported: 0,
        errors: [{ filename: "", error: "Failed to import files" }],
      });
      setImportStatus("error");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleExport = async () => {
    setExportStatus("generating");

    try {
      const url = `/api/export${
        includeBacklinks ? "?includeBacklinks=true" : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "nexus-export.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setExportStatus("complete");
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 bg-[var(--color-surface,#16213e)] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-lg font-medium text-[var(--color-text,#e8e6e3)]">
            Import / Export
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/10 text-[var(--color-text-muted,#a8a6a3)]"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("import")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "import"
                ? "text-[var(--color-accent,#c77dff)] border-b-2 border-[var(--color-accent,#c77dff)]"
                : "text-[var(--color-text-muted,#a8a6a3)] hover:text-[var(--color-text,#e8e6e3)]"
            }`}
          >
            Import
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "export"
                ? "text-[var(--color-accent,#c77dff)] border-b-2 border-[var(--color-accent,#c77dff)]"
                : "text-[var(--color-text-muted,#a8a6a3)] hover:text-[var(--color-text,#e8e6e3)]"
            }`}
          >
            Export
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "import" ? (
            <ImportTab
              status={importStatus}
              result={importResult}
              dragActive={dragActive}
              fileInputRef={fileInputRef}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFiles={handleFiles}
              onReset={resetState}
            />
          ) : (
            <ExportTab
              status={exportStatus}
              includeBacklinks={includeBacklinks}
              onIncludeBacklinksChange={setIncludeBacklinks}
              onExport={handleExport}
              onReset={() => setExportStatus("idle")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Import Tab Component
interface ImportTabProps {
  status: ImportStatus;
  result: ImportResult | null;
  dragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFiles: (files: FileList | null) => void;
  onReset: () => void;
}

function ImportTab({
  status,
  result,
  dragActive,
  fileInputRef,
  onDrag,
  onDrop,
  onFiles,
  onReset,
}: ImportTabProps) {
  if (status === "uploading") {
    return (
      <div className="flex flex-col items-center py-8">
        <LoadingSpinner />
        <p className="mt-4 text-[var(--color-text-muted,#a8a6a3)]">
          Importing files...
        </p>
      </div>
    );
  }

  if (status === "complete" || status === "error") {
    return (
      <div className="py-4">
        {result && result.imported > 0 && (
          <div className="flex items-center gap-2 text-green-400 mb-4">
            <CheckIcon className="w-5 h-5" />
            <span>Successfully imported {result.imported} note(s)</span>
          </div>
        )}
        {result && result.errors.length > 0 && (
          <div className="mb-4">
            <p className="text-red-400 mb-2">
              {result.errors.length} file(s) failed:
            </p>
            <ul className="text-sm text-[var(--color-text-muted,#a8a6a3)] space-y-1 max-h-32 overflow-y-auto">
              {result.errors.map((err, i) => (
                <li key={i}>
                  {err.filename ? `${err.filename}: ` : ""}
                  {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={onReset}
          className="w-full py-2 px-4 bg-[var(--color-primary,#7b2cbf)] hover:bg-[var(--color-primary,#7b2cbf)]/80 text-white rounded-lg transition-colors"
        >
          Import More
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-[var(--color-accent,#c77dff)] bg-[var(--color-accent,#c77dff)]/10"
            : "border-white/20 hover:border-white/40"
        }`}
      >
        <UploadIcon className="w-10 h-10 mx-auto text-[var(--color-text-muted,#a8a6a3)]" />
        <p className="mt-4 text-[var(--color-text,#e8e6e3)]">
          Drag and drop .md files here
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-muted,#a8a6a3)]">
          or click to select files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 py-2 px-4 bg-white/10 hover:bg-white/20 text-[var(--color-text,#e8e6e3)] rounded-lg transition-colors"
        >
          Select Files
        </button>
      </div>
      <p className="mt-3 text-xs text-[var(--color-text-muted,#a8a6a3)]">
        Supports markdown files with YAML frontmatter (title, tags)
      </p>
    </div>
  );
}

// Export Tab Component
interface ExportTabProps {
  status: ExportStatus;
  includeBacklinks: boolean;
  onIncludeBacklinksChange: (value: boolean) => void;
  onExport: () => void;
  onReset: () => void;
}

function ExportTab({
  status,
  includeBacklinks,
  onIncludeBacklinksChange,
  onExport,
  onReset,
}: ExportTabProps) {
  if (status === "generating") {
    return (
      <div className="flex flex-col items-center py-8">
        <LoadingSpinner />
        <p className="mt-4 text-[var(--color-text-muted,#a8a6a3)]">
          Generating zip file...
        </p>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className="py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
          <CheckIcon className="w-5 h-5" />
          <span>Download started!</span>
        </div>
        <button
          onClick={onReset}
          className="py-2 px-4 bg-white/10 hover:bg-white/20 text-[var(--color-text,#e8e6e3)] rounded-lg transition-colors"
        >
          Export Again
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-4 text-center">
        <p className="text-red-400 mb-4">Export failed. Please try again.</p>
        <button
          onClick={onReset}
          className="py-2 px-4 bg-white/10 hover:bg-white/20 text-[var(--color-text,#e8e6e3)] rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[var(--color-text,#e8e6e3)] mb-4">
        Download all your notes as a zip file of markdown files.
      </p>
      <label className="flex items-center gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={includeBacklinks}
          onChange={(e) => onIncludeBacklinksChange(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-white/10 text-[var(--color-accent,#c77dff)] focus:ring-[var(--color-accent,#c77dff)]"
        />
        <span className="text-sm text-[var(--color-text,#e8e6e3)]">
          Include backlinks in frontmatter
        </span>
      </label>
      <button
        onClick={onExport}
        className="w-full py-3 px-4 bg-[var(--color-primary,#7b2cbf)] hover:bg-[var(--color-primary,#7b2cbf)]/80 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <DownloadIcon className="w-5 h-5" />
        Download All Notes
      </button>
    </div>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="w-8 h-8 animate-spin text-[var(--color-accent,#c77dff)]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
