"use client";

import { X, Loader2 } from "lucide-react";
import { useEffect } from "react";

export type ModalField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  full?: boolean;
  min?: number;
  step?: number;
};

export default function AdminModal({
  open,
  title,
  fields,
  values,
  onChange,
  onSave,
  saving,
  onClose,
  errors,
}: {
  open: boolean;
  title: string;
  fields: ModalField[];
  values: Record<string, string | number>;
  onChange: (name: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  onClose: () => void;
  errors?: Record<string, string>;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_20px_60px_rgba(20,16,40,.18)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EEEDF4] bg-white px-6 py-4">
          <h3 className="text-[16px] font-bold text-[#1F1836]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-[28px] w-[28px] place-items-center rounded-[6px] text-[#8B879C] hover:bg-[#F7F6FB]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.name}
                className={f.full ? "sm:col-span-2" : undefined}
              >
                <label className="mb-[5px] block text-[11.5px] font-medium text-[#3D3752]">
                  {f.label} {f.required && <span className="text-red-400">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    value={values[f.name] ?? ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className={`w-full rounded-[8px] border bg-white px-3 py-2.5 text-[12px] text-[#1F1836] outline-none transition-colors placeholder:text-[#A5A2B5] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 ${
                      errors?.[f.name] ? "border-red-400" : "border-[#E7E5EF]"
                    }`}
                  />
                ) : f.type === "select" ? (
                  <select
                    value={values[f.name] ?? ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    className={`h-[38px] w-full appearance-none rounded-[8px] border bg-white px-3 pr-8 text-[12px] text-[#1F1836] outline-none transition-colors focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 ${
                      errors?.[f.name] ? "border-red-400" : "border-[#E7E5EF]"
                    }`}
                  >
                    <option value="">{f.placeholder || "Select..."}</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    value={values[f.name] ?? ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    min={f.min}
                    step={f.step}
                    className={`h-[38px] w-full rounded-[8px] border bg-white px-3 text-[12px] text-[#1F1836] outline-none transition-colors placeholder:text-[#A5A2B5] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 ${
                      errors?.[f.name] ? "border-red-400" : "border-[#E7E5EF]"
                    }`}
                  />
                )}
                {errors?.[f.name] && (
                  <p className="mt-1 text-[11px] text-red-500">{errors[f.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#EEEDF4] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-[8px] border border-[#E7E5EF] bg-white px-4 py-2 text-[12px] font-medium text-[#3D3752] hover:bg-[#F7F6FB] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-[8px] bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-2 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(109,40,217,.25)] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
