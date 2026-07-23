"use client";

import { UserRound, Pencil, ChevronDown, Loader2, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Profile = {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  tob?: string;
  birthplace?: string;
  gender?: string;
  language?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
};

type FormErrors = Partial<Record<keyof Profile, string>>;

// MySQL DATE columns come back from the API as a full ISO timestamp, which
// <input type="date"> cannot display — it renders blank and the user silently
// loses the value.
//
// Slicing the first 10 characters is NOT correct: mysql2 turns a DATE into a JS
// Date at *local* midnight, so 1995-04-12 serialises to "1995-04-11T18:30:00Z"
// in IST — a day earlier. Taking the string prefix would show the wrong date and
// shift it back another day on every save. Read the local calendar parts
// instead, which inverts that encoding.
function toDateInput(value?: string): string {
  if (!value) return "";
  // Already a plain calendar date — use it verbatim.
  const plain = /^(\d{4}-\d{2}-\d{2})$/.exec(value);
  if (plain) return plain[1];
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// TIME columns arrive as "14:30:00"; <input type="time"> wants "HH:MM".
function toTimeInput(value?: string): string {
  if (!value) return "";
  const match = /^(\d{2}:\d{2})/.exec(value);
  return match ? match[1] : "";
}

function formFromUser(user: Profile): Profile {
  return {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    dob: toDateInput(user.dob),
    tob: toTimeInput(user.tob),
    birthplace: user.birthplace || "",
    gender: user.gender || "",
    language: user.language || "",
    country: user.country || "",
    state: user.state || "",
    city: user.city || "",
    address: user.address || "",
  };
}

// `email` is intentionally not validated: it identifies the account and the API
// will not change it via PATCH /api/users/me, so it renders read-only.
function validate(form: Profile): FormErrors {
  const e: FormErrors = {};
  if (!form.name?.trim()) e.name = "Full name is required";
  if (!form.phone?.trim()) {
    e.phone = "Mobile number is required";
  } else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
    e.phone = "Enter a valid 10-digit mobile number";
  }
  if (!form.dob?.trim()) e.dob = "Date of birth is required";
  if (!form.gender?.trim()) e.gender = "Gender is required";
  return e;
}

function EditableField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  dropdown,
  full,
  required,
}: {
  label: string;
  name: keyof Profile;
  value: string;
  onChange: (name: keyof Profile, val: string) => void;
  error?: string;
  type?: string;
  dropdown?: boolean;
  full?: boolean;
  required?: boolean;
}) {
  return (
    <div className={full ? "lg:col-span-3" : undefined}>
      <label className="block text-[12.5px] text-[#6c6b78]">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative mt-[7px]">
        {dropdown ? (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => onChange(name, e.target.value)}
              className={`h-[46px] w-full appearance-none rounded-[10px] border bg-white px-[15px] pr-10 text-[14px] text-[#2b0f47] outline-none transition-colors focus:border-[#6b3fa0] focus:ring-1 focus:ring-[#6b3fa0]/30 ${
                error ? "border-red-400" : "border-[#e7e1ef]"
              }`}
            >
              <option value="">Select...</option>
              {name === "gender" && (
                <>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </>
              )}
              {name === "language" && (
                <>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                </>
              )}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8b8697]" strokeWidth={2} />
          </div>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className={`h-[46px] w-full rounded-[10px] border bg-white px-[15px] text-[14px] text-[#2b0f47] outline-none transition-colors focus:border-[#6b3fa0] focus:ring-1 focus:ring-[#6b3fa0]/30 ${
              error ? "border-red-400" : "border-[#e7e1ef]"
            }`}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-[12px] text-red-500">{error}</p>
      )}
    </div>
  );
}

function ReadonlyField({
  label,
  value,
  dropdown,
  full,
  hint,
}: {
  label: string;
  value: string;
  dropdown?: boolean;
  full?: boolean;
  hint?: string;
}) {
  return (
    <div className={full ? "lg:col-span-3" : undefined}>
      <label className="block text-[12.5px] text-[#6c6b78]">{label}</label>
      <div
        className={`relative mt-[7px] flex h-[46px] items-center rounded-[10px] border border-[#e7e1ef] px-[15px] ${
          hint ? "bg-[#f7f5fa]" : "bg-white"
        }`}
      >
        <span className="text-[14px] text-[#2b0f47]">{value}</span>
        {dropdown ? (
          <ChevronDown className="ml-auto h-[18px] w-[18px] text-[#8b8697]" strokeWidth={2} />
        ) : null}
      </div>
      {hint && <p className="mt-1 text-[12px] text-[#8b8697]">{hint}</p>}
    </div>
  );
}

export default function PersonalInformation() {
  const { data: profile, loading, error, refetch } = useApi<any>(() => api.getProfile());
  const user: Profile = profile?.user || profile || {};

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Profile>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"success" | "error" | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // No effect syncs `form` from `profile`: the read-only view renders straight
  // from `user`, so the draft only has to exist while editing. The previous
  // version synced on every render (its dep was the freshly-allocated
  // `profile?.user || profile || {}`), which cascaded renders for no benefit.
  const handleChange = (name: keyof Profile, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (saveMsg) { setSaveMsg(null); setSaveErr(null); }
  };

  const handleEdit = () => {
    setForm(formFromUser(user));
    setEditing(true);
    setErrors({});
    setSaveMsg(null);
    setSaveErr(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    setSaveMsg(null);
    setSaveErr(null);
    setForm(formFromUser(user));
  };

  const handleSubmit = async () => {
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);
    try {
      // `email` is omitted deliberately — the API strips it as an unknown key
      // (see the updateProfile schema); changing it needs a re-verification flow.
      const payload: Profile = {
        name: form.name?.trim(),
        phone: form.phone?.trim(),
        dob: form.dob?.trim(),
        birthplace: form.birthplace?.trim() || "",
        gender: form.gender?.trim() || "",
        language: form.language?.trim() || "",
        country: form.country?.trim() || "",
        state: form.state?.trim() || "",
        city: form.city?.trim() || "",
        address: form.address?.trim() || "",
      };
      // `tob` is validated as a bare HH:MM regex with no .allow("") — sending an
      // empty string 400s, so only include it when the user actually set one.
      const tob = form.tob?.trim();
      if (tob) payload.tob = tob;

      await api.updateProfile(payload);
      setSaveMsg("success");
      setEditing(false);
      refetch();
    } catch (e: unknown) {
      // Surface what the API actually said — a generic "try again" hides real,
      // actionable causes such as a rejected date/time format.
      setSaveErr((e as Error)?.message || null);
      setSaveMsg("error");
    } finally {
      setSaving(false);
    }
  };

  const fields: {
    label: string;
    name: keyof Profile;
    dropdown?: boolean;
    full?: boolean;
    type?: string;
    required?: boolean;
    readOnly?: boolean;
  }[] = [
    { label: "Full Name", name: "name", required: true },
    // Read-only: PATCH /api/users/me does not accept `email`.
    { label: "Email Address", name: "email", type: "email", readOnly: true },
    { label: "Mobile Number", name: "phone", type: "tel", required: true },
    { label: "Date of Birth", name: "dob", type: "date", required: true },
    // Birth time/place drive kundali generation, and the API already stores them.
    { label: "Time of Birth", name: "tob", type: "time" },
    { label: "Place of Birth", name: "birthplace" },
    { label: "Gender", name: "gender", dropdown: true, required: true },
    { label: "Language", name: "language", dropdown: true },
    { label: "Country", name: "country" },
    { label: "State", name: "state" },
    { label: "City", name: "city" },
    { label: "Address", name: "address", full: true },
  ];

  return (
    <div className="rounded-[16px] border border-[#efe6d6] bg-white px-6 pb-6 pt-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <UserRound className="h-[22px] w-[22px] text-[#6b3fa0]" strokeWidth={1.8} />
          <h2 className="font-display text-[20px] font-bold text-[#2b0f47]">
            Personal Information
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e7e1ef] bg-white px-4 py-[9px] text-[13px] font-medium text-[#6c6b78] transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                <X className="h-[14px] w-[14px]" strokeWidth={2} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-[#3b0f6d] via-[#4c1d95] to-[#6d28d9] px-[15px] py-[9px] text-[13px] font-medium text-white shadow-[0_4px_12px_rgba(75,31,131,.25)] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-[15px] w-[15px] animate-spin" />
                ) : (
                  <CheckCircle2 className="h-[15px] w-[15px]" strokeWidth={1.9} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#cbb6ec] bg-white px-[15px] py-[9px] text-[13px] font-medium text-[#6b3fa0] transition-colors hover:bg-[#f8f4fd]"
            >
              <Pencil className="h-[15px] w-[15px]" strokeWidth={1.9} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Save feedback */}
      {saveMsg === "success" && (
        <div className="mt-4 flex items-center gap-2 rounded-[10px] bg-[#e6f7ec] px-4 py-3 text-[13px] font-medium text-[#1f9254]">
          <CheckCircle2 className="h-[16px] w-[16px]" strokeWidth={2} />
          Profile updated successfully!
        </div>
      )}
      {saveMsg === "error" && (
        <div className="mt-4 rounded-[10px] bg-[#fdeaf0] px-4 py-3 text-[13px] font-medium text-[#e0567f]">
          {saveErr || "Failed to update profile. Please try again."}
        </div>
      )}

      {/* Form */}
      {loading ? (
        <div className="mt-[22px] flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile...
        </div>
      ) : error ? (
        <p className="mt-[22px] text-[12.5px] text-red-500">{error}</p>
      ) : (
        <div className="mt-[22px] grid grid-cols-1 gap-x-[18px] gap-y-[15px] sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((f) =>
            editing && !f.readOnly ? (
              <EditableField
                key={f.name}
                label={f.label}
                name={f.name}
                value={form[f.name] || ""}
                onChange={handleChange}
                error={errors[f.name]}
                type={f.type}
                dropdown={f.dropdown}
                full={f.full}
                required={f.required}
              />
            ) : (
              <ReadonlyField
                key={f.name}
                label={f.label}
                value={
                  f.name === "address"
                    ? [user.address, user.city, user.state, user.country].filter(Boolean).join(", ") || "—"
                    : f.name === "dob"
                      ? toDateInput(user.dob) || "—"
                      : f.name === "tob"
                        ? toTimeInput(user.tob) || "—"
                        : user[f.name] || "—"
                }
                dropdown={f.dropdown && !f.readOnly}
                full={f.full}
                hint={editing && f.readOnly ? "Cannot be changed here" : undefined}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
