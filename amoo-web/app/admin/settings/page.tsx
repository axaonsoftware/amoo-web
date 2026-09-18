"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import AdminPageHeader from "../shared/AdminPageHeader";
import { useToast } from "../shared/useToast";

const FIELD_KEYS = [
  "platform_name",
  "commission_rate",
  "tax_rate",
  "support_email",
  "support_phone",
  "maintenance_mode",
  "terms_and_conditions",
  "privacy_policy",
  "gateway_provider",
  "razorpay_key_id",
  "razorpay_key_secret",
  "webhook_url",
  "template_booking_confirmation",
  "template_payment_received",
  "template_booking_reminder",
  "template_cancellation_notice",
] as const;

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[#EEEDF4] bg-white p-5"
        >
          <div className="mb-3 h-4 w-32 animate-pulse rounded bg-[#E5E1F0]" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-[#F0EDF5]" />
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast, Toast } = useToast();

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.admin.getSettings();
      const data =
        res && typeof res === "object" && !Array.isArray(res)
          ? (res as Record<string, unknown>)
          : {};
      const mapped: Record<string, string> = {};
      for (const key of FIELD_KEYS) {
        mapped[key] = String(data[key] ?? "");
      }
      setSettings(mapped);
    } catch {
      setSettings(
        Object.fromEntries(FIELD_KEYS.map((k) => [k, ""])) as Record<
          string,
          string
        >,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.updateSettings(settings);
      showToast("Settings saved successfully");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <AdminPageHeader
        title="Platform Settings"
        description="Configure global platform options, rates, and policies."
        Icon={Settings}
      />

      {loading ? (
        <div className="mt-6">
          <SettingsSkeleton />
        </div>
      ) : (
        <div className="mt-6 max-w-3xl space-y-5">
          {/* Platform Name */}
          <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
            <label
              htmlFor="platform_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Platform Name
            </label>
            <input
              id="platform_name"
              type="text"
              value={settings.platform_name ?? ""}
              onChange={(e) => handleChange("platform_name", e.target.value)}
              className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Commission + Tax Rate side by side */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
              <label
                htmlFor="commission_rate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Commission Rate (%)
              </label>
              <input
                id="commission_rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={settings.commission_rate ?? ""}
                onChange={(e) => handleChange("commission_rate", e.target.value)}
                className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
              <label
                htmlFor="tax_rate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Tax Rate (%)
              </label>
              <input
                id="tax_rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={settings.tax_rate ?? ""}
                onChange={(e) => handleChange("tax_rate", e.target.value)}
                className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Support Email + Phone */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
              <label
                htmlFor="support_email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Support Email
              </label>
              <input
                id="support_email"
                type="email"
                value={settings.support_email ?? ""}
                onChange={(e) => handleChange("support_email", e.target.value)}
                placeholder="support@example.com"
                className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
              <label
                htmlFor="support_phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Support Phone
              </label>
              <input
                id="support_phone"
                type="text"
                value={settings.support_phone ?? ""}
                onChange={(e) => handleChange("support_phone", e.target.value)}
                placeholder="+91 98765 xxxxx"
                className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Maintenance Mode
                </label>
                <p className="mt-0.5 text-xs text-gray-500">
                  When enabled, only admins can access the platform.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.maintenance_mode === "true"}
                onClick={() =>
                  handleChange(
                    "maintenance_mode",
                    settings.maintenance_mode === "true" ? "false" : "true",
                  )
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  settings.maintenance_mode === "true"
                    ? "bg-[#6D28D9]"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    settings.maintenance_mode === "true"
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  } mt-0.5`}
                />
              </button>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
            <label
              htmlFor="terms_and_conditions"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Terms &amp; Conditions
            </label>
            <textarea
              id="terms_and_conditions"
              rows={5}
              value={settings.terms_and_conditions ?? ""}
              onChange={(e) =>
                handleChange("terms_and_conditions", e.target.value)
              }
              className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Privacy Policy */}
          <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
            <label
              htmlFor="privacy_policy"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Privacy Policy
            </label>
            <textarea
              id="privacy_policy"
              rows={5}
              value={settings.privacy_policy ?? ""}
              onChange={(e) => handleChange("privacy_policy", e.target.value)}
              className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Payment Gateway Configuration */}
          <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-800">
              Payment Gateway Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="gateway_provider"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Gateway Provider
                </label>
                <select
                  id="gateway_provider"
                  value={settings.gateway_provider ?? ""}
                  onChange={(e) =>
                    handleChange("gateway_provider", e.target.value)
                  }
                  className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select gateway...</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="razorpay_key_id"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Razorpay Key ID
                  </label>
                  <input
                    id="razorpay_key_id"
                    type="password"
                    value={settings.razorpay_key_id ?? ""}
                    onChange={(e) =>
                      handleChange("razorpay_key_id", e.target.value)
                    }
                    placeholder="rzp_test_..."
                    className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="razorpay_key_secret"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Razorpay Key Secret
                  </label>
                  <input
                    id="razorpay_key_secret"
                    type="password"
                    value={settings.razorpay_key_secret ?? ""}
                    onChange={(e) =>
                      handleChange("razorpay_key_secret", e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="webhook_url"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Webhook URL
                </label>
                <input
                  id="webhook_url"
                  type="text"
                  readOnly
                  value={
                    settings.webhook_url ||
                    `${typeof window !== "undefined" ? window.location.origin : ""}/api/payments/webhook`
                  }
                  className="w-full cursor-not-allowed rounded-lg border border-[#E5E1F0] bg-gray-50 px-3 py-2.5 text-sm text-gray-500 outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Configure this URL in your gateway dashboard. Read-only here.
                </p>
              </div>
            </div>
          </div>

          {/* Notification Templates */}
          <div className="rounded-xl border border-[#EEEDF4] bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-800">
              Notification Templates
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="template_booking_confirmation"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Booking Confirmation
                </label>
                <textarea
                  id="template_booking_confirmation"
                  rows={3}
                  value={settings.template_booking_confirmation ?? ""}
                  onChange={(e) =>
                    handleChange("template_booking_confirmation", e.target.value)
                  }
                  placeholder="e.g. Hi {{name}}, your booking for {{service}} on {{date}} is confirmed."
                  className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="template_payment_received"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Payment Received
                </label>
                <textarea
                  id="template_payment_received"
                  rows={3}
                  value={settings.template_payment_received ?? ""}
                  onChange={(e) =>
                    handleChange("template_payment_received", e.target.value)
                  }
                  placeholder="e.g. Payment of ₹{{amount}} received for booking {{ref}}."
                  className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="template_booking_reminder"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Booking Reminder
                </label>
                <textarea
                  id="template_booking_reminder"
                  rows={3}
                  value={settings.template_booking_reminder ?? ""}
                  onChange={(e) =>
                    handleChange("template_booking_reminder", e.target.value)
                  }
                  placeholder="e.g. Reminder: You have a {{service}} session tomorrow at {{time}}."
                  className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label
                  htmlFor="template_cancellation_notice"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Cancellation Notice
                </label>
                <textarea
                  id="template_cancellation_notice"
                  rows={3}
                  value={settings.template_cancellation_notice ?? ""}
                  onChange={(e) =>
                    handleChange("template_cancellation_notice", e.target.value)
                  }
                  placeholder="e.g. Your booking {{ref}} has been cancelled. Refund will be processed shortly."
                  className="w-full rounded-lg border border-[#E5E1F0] px-3 py-2.5 text-sm text-[#3D3752] outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pb-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#6D28D9] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#5B21B6] disabled:opacity-50"
            >
              {saving && (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      <Toast />
    </main>
  );
}
