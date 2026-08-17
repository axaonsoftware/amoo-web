"use client";

import { Video, CalendarDays, Clock, Tag } from "lucide-react";
import { formatCurrency } from "../../../lib/format";
import type { AppliedCoupon } from "./CouponCard";

/**
 * Presentational summary of the booking about to be paid for.
 *
 * Every figure is passed in from the page, which reads it from `services.price`
 * — the same value POST /api/bookings validates against and the Razorpay order
 * is built from.
 *
 * This component previously computed the price itself from a hardcoded map:
 *   const MODE_PRICES = { "Audio Call": 499, "Video Call": 999, Chat: 349 };
 *   const discount = Math.round(pricing.price * 0.1);   // invented 10%
 *   const total = pricing.price - discount;
 * and labelled that discount "Discount (FIRST10)" — a coupon the customer had
 * not entered. None of it came from the database, so the total displayed on the
 * checkout page was unrelated to the amount actually charged.
 */
export default function BookingSummary({
  service,
  mode,
  date,
  time,
  duration,
  price,
  coupon,
  total,
}: {
  service: string;
  mode: string;
  date: string;
  time: string;
  duration?: string;
  price: number;
  coupon: AppliedCoupon | null;
  total: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-2 px-5 py-4"
        style={{ background: "linear-gradient(90deg,#3E1E7A 0%,#5B2A9D 100%)" }}
      >
        <span className="text-amber-400" aria-hidden="true">
          ✦
        </span>
        <h3 className="text-white font-serif font-semibold text-base">
          Booking Summary
        </h3>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3 pb-5 border-b border-gray-100">
          <span
            className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center text-xl shrink-0"
            aria-hidden="true"
          >
            🪷
          </span>
          <div>
            <p className="font-semibold text-[#3E1E7A] text-sm">{service}</p>
            <p className="text-xs text-gray-500 mt-0.5">Consultation</p>
          </div>
        </div>

        <dl className="space-y-4 pt-5 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <dt className="flex items-center gap-2 text-gray-600">
              <Video className="w-4 h-4 text-amber-500" aria-hidden="true" />
              Mode
            </dt>
            <dd className="font-semibold text-[#3E1E7A]">{mode}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="flex items-center gap-2 text-gray-600">
              <CalendarDays
                className="w-4 h-4 text-amber-500"
                aria-hidden="true"
              />
              Date
            </dt>
            <dd className="font-semibold text-[#3E1E7A] text-right">{date}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-amber-500" aria-hidden="true" />
              Time
            </dt>
            <dd className="font-semibold text-[#3E1E7A]">{time} (IST)</dd>
          </div>
          {/* Only shown when services.duration is actually set — this used to
              claim a flat "60 Minutes" for every service regardless. */}
          {duration && (
            <div className="flex items-center justify-between text-sm">
              <dt className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Duration
              </dt>
              <dd className="font-semibold text-[#3E1E7A]">{duration}</dd>
            </div>
          )}
        </dl>

        <dl className="space-y-2 pt-5">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-gray-600">Consultation Fee</dt>
            <dd className="font-medium text-[#3E1E7A]">
              {formatCurrency(price)}
            </dd>
          </div>
          {coupon && (
            <div className="flex items-center justify-between text-sm">
              <dt className="flex items-center gap-1 text-gray-600">
                <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                Discount ({coupon.code})
              </dt>
              <dd className="text-green-600 font-medium">
                - {formatCurrency(coupon.discount)}
              </dd>
            </div>
          )}
          <div className="border-t border-dashed border-gray-200 pt-2 flex items-center justify-between">
            <dt className="font-bold text-[#3E1E7A]">Total Amount</dt>
            <dd className="font-bold text-xl text-[#3E1E7A]">
              {formatCurrency(total)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
