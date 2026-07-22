"use client";

import Image from "next/image";
import { Loader2, RefreshCw, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function WalletCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = () => {
    setBusy(true);
    setLoadError(false);
    api
      .getWallet()
      .then((w: any) => setBalance(Number(w?.balance ?? 0)))
      .catch(() => { setBalance(null); setLoadError(true); })
      .finally(() => setBusy(false));
  };

  useEffect(() => { load(); }, []);

  const loading = busy && balance === null;

  return (
    <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#2a0d4a] via-[#1d0733] to-[#150525] p-[18px] shadow-[0_10px_30px_rgba(26,7,48,.25)]">
      <div className="stars pointer-events-none absolute inset-0 opacity-40" />

      <Image
        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=380&q=80"
        alt=""
        aria-hidden="true"
        width={380}
        height={300}
        className="pointer-events-none absolute right-0 top-0 h-[150px] w-[190px] object-contain opacity-90"
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Wallet className="h-[18px] w-[18px] text-[#e9b85c]" strokeWidth={1.8} />
          <h3 className="font-display text-[17px] font-bold text-[#f3c76e]">My Wallet</h3>
        </div>

        {/* Balance */}
        <p className="mt-[16px] text-[12px] text-white/70">Current Balance</p>
        {loading ? (
          <div className="mt-[6px] flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-white/60" />
            <span className="text-[14px] text-white/50">Loading balance...</span>
          </div>
        ) : loadError ? (
          <div className="mt-[6px] flex items-center gap-2">
            <p className="font-display font-bold text-white">
              <span className="text-[30px] leading-none">₹ —</span>
            </p>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400 underline underline-offset-2 hover:text-red-300"
            >
              <RefreshCw className="h-[11px] w-[11px]" />
              Retry
            </button>
          </div>
        ) : (
          <p className="mt-[6px] font-display font-bold text-white">
            <span className="text-[30px] leading-none">
              ₹ {(balance ?? 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[17px] leading-none">.00</span>
          </p>
        )}
        {loadError && (
          <p className="mt-1 text-[11px] text-red-400">Failed to load wallet balance</p>
        )}

        {/* Info */}
        <div className="mt-[22px] rounded-[10px] border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[12px] leading-[1.5] text-white/60">
            Your wallet balance is managed by admin. Contact support to add funds to your wallet.
          </p>
        </div>
      </div>
    </section>
  );
}
