"use client";

import { useState } from "react";
import {
  CreditCard,
  Landmark,
  Wallet,
  Clock3,
  Copy,
  Sparkles,
} from "lucide-react";

const methods = [
  {
    id: "upi",
    label: "UPI",
    desc: "Fast & Secure",
    icon: () => (
      <span className="text-[10px] font-bold text-[#5B2A9D] leading-none">
        UPI
      </span>
    ),
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, Rupay",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    desc: "All Major Banks",
    icon: Landmark,
  },
  {
    id: "wallets",
    label: "Wallets",
    desc: "Paytm, PhonePe, Mobikwik",
    icon: Wallet,
  },
  {
    id: "paylater",
    label: "Pay Later",
    desc: "LazyPay, Simpl, etc.",
    icon: Clock3,
  },
];

export default function PaymentMethodCard() {
  const [selected, setSelected] = useState("upi");
  const [upiId, setUpiId] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-[#3E1E7A] text-white text-xs flex items-center justify-center font-semibold">
          A
        </span>
        <h3 className="text-[#3E1E7A] font-semibold text-base">
          1. Choose Payment Method
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
        {/* Method list */}
        <div className="flex flex-col gap-3">
          {methods.map((m) => {
            const Icon = m.icon;
            const active = selected === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`flex items-center gap-3 text-left rounded-xl border px-3.5 py-3 transition ${
                  active
                    ? "border-[#5B2A9D] bg-[#F4F1FA]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {typeof Icon === "function" && m.id === "upi" ? (
                    <Icon />
                  ) : (
                    <Icon size={18} className="text-[#5B2A9D]" />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-800">
                    {m.label}
                  </span>
                  <span className="block text-xs text-gray-400">{m.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* UPI payment panel */}
        <div className="border border-gray-100 rounded-xl p-5">
          <h4 className="text-[#3E1E7A] font-semibold text-sm mb-1">
            Pay using UPI
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Scan QR code or enter UPI ID to make payment
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* QR code */}
            <div className="w-full sm:w-40 h-40 rounded-xl border border-gray-200 flex items-center justify-center shrink-0 bg-white">
              <QrPlaceholder />
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="border border-gray-200 rounded-lg px-3 py-2.5">
                <p className="text-[11px] text-gray-400">UPI ID</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    amooguru@okaxis
                  </span>
                  <Copy size={14} className="text-gray-400 cursor-pointer" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg px-3 py-2.5">
                <p className="text-[11px] text-gray-400 mb-2">
                  Or pay from any UPI app
                </p>
                <div className="flex items-center gap-3">
                  <GPayBadge />
                  <PhonePeBadge />
                  <PaytmBadge />
                </div>
                <BhimBadge />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <label
            htmlFor="paymentmethodcard-enter-upi-id"
            className="block text-xs font-medium text-gray-700 mb-1.5"
          >
            Enter UPI ID
          </label>
          <div className="flex gap-3">
            <input
              id="paymentmethodcard-enter-upi-id"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="name@bank"
              className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              className="px-5 py-2.5 rounded-lg text-white text-sm font-medium shrink-0"
              style={{ background: "#3E1E7A" }}
            >
              Verify &amp; Pay
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6 bg-[#F4F1FA] rounded-lg px-4 py-3 text-xs sm:text-sm text-[#5B2A9D]">
        <Sparkles size={15} className="shrink-0" />
        After successful payment, you will be redirected to the confirmation
        page.
      </div>
    </div>
  );
}

function QrPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" width="90%" height="90%">
      <rect width="100" height="100" fill="white" />
      {Array.from({ length: 12 }).map((_, r) =>
        Array.from({ length: 12 }).map((_, c) =>
          (r + c) % 3 === 0 || (r * c) % 5 === 0 ? (
            <rect
              key={`${r}-${c}`}
              x={r * 8}
              y={c * 8}
              width="7"
              height="7"
              fill="#150b21"
            />
          ) : null,
        ),
      )}
      <rect
        x="0"
        y="0"
        width="24"
        height="24"
        fill="none"
        stroke="#150b21"
        strokeWidth="4"
      />
      <rect
        x="76"
        y="0"
        width="24"
        height="24"
        fill="none"
        stroke="#150b21"
        strokeWidth="4"
      />
      <rect
        x="0"
        y="76"
        width="24"
        height="24"
        fill="none"
        stroke="#150b21"
        strokeWidth="4"
      />
      <circle
        cx="50"
        cy="50"
        r="10"
        fill="white"
        stroke="#5B2A9D"
        strokeWidth="2"
      />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fontSize="10"
        fill="#5B2A9D"
        fontWeight="bold"
      >
        A
      </text>
    </svg>
  );
}

function GPayBadge() {
  return (
    <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-semibold">
      <svg width="16" height="16" viewBox="0 0 48 48">
        <path
          fill="#4285F4"
          d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
        />
        <path
          fill="#34A853"
          d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
        />
        <path
          fill="#FBBC05"
          d="M11.69 28.18A13.9 13.9 0 0 1 10.9 24c0-1.45.25-2.86.7-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
        />
        <path
          fill="#EA4335"
          d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
        />
      </svg>
    </span>
  );
}
function PhonePeBadge() {
  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
      style={{ background: "#5F259F" }}
    >
      Pe
    </span>
  );
}
function PaytmBadge() {
  return <span className="text-xs font-semibold text-[#00B9F1]">Paytm</span>;
}
function BhimBadge() {
  return <p className="text-xs font-semibold text-orange-600 mt-2">BHIM</p>;
}
