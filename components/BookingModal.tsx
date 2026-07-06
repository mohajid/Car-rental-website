"use client";

import type { Car } from "@/data/cars";
import { useState } from "react";

type Step = "details" | "documents" | "payment" | "success";

interface BookingFormData {
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  emiratesIdOrPassport: string;
}

const initialFormData: BookingFormData = {
  pickupLocation: "",
  dropoffLocation: "",
  startDate: "",
  endDate: "",
  fullName: "",
  phone: "",
  email: "",
  licenseNumber: "",
  licenseExpiry: "",
  emiratesIdOrPassport: "",
};

function calculateDays(start: string, end: string) {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

function calculateTotal(car: Car, days: number) {
  if (days <= 0) return 0;
  if (days >= 28) {
    const months = Math.floor(days / 28);
    const remainderDays = days % 28;
    return months * car.pricing.monthly + remainderDays * car.pricing.daily;
  }
  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remainderDays = days % 7;
    return weeks * car.pricing.weekly + remainderDays * car.pricing.daily;
  }
  return days * car.pricing.daily;
}

const inputClassName =
  "w-full rounded border border-graphite bg-transparent px-3 py-2 text-sm text-chalk outline-none transition focus:border-ash";
const labelClassName = "block text-sm font-normal text-smoke mb-1";

export default function BookingModal({
  car,
  onClose,
}: {
  car: Car;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("details");
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const days = calculateDays(formData.startDate, formData.endDate);
  const total = calculateTotal(car, days);

  function updateField<K extends keyof BookingFormData>(
    key: K,
    value: BookingFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("documents");
  }

  function handleDocumentsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("payment");
  }

  function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessingPayment(true);
    // Demo payment: simulate a processing delay, no real gateway is called.
    setTimeout(() => {
      setIsProcessingPayment(false);
      setStep("success");
    }, 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/70 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-graphite bg-carbon">
        {/* Header */}
        <div className="sticky top-0 bg-carbon border-b border-graphite px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-normal text-chalk">
              {car.year} {car.model}
            </h2>
            <p className="text-sm text-smoke">{car.brand} · {car.category}</p>
          </div>
          <button
            onClick={onClose}
            className="text-smoke hover:text-chalk text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress indicator */}
        {step !== "success" && (
          <div className="flex gap-2 px-6 pt-4">
            {(["details", "documents", "payment"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  ["details", "documents", "payment"].indexOf(step) >= i
                    ? "bg-chalk"
                    : "bg-graphite"
                }`}
              />
            ))}
          </div>
        )}

        <div className="px-6 py-5">
          {step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <h3 className="font-normal text-chalk">Trip details</h3>

              <div>
                <label className={labelClassName}>
                  Pickup location
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dubai Marina"
                  value={formData.pickupLocation}
                  onChange={(e) => updateField("pickupLocation", e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Drop-off location
                </label>
                <input
                  required
                  type="text"
                  placeholder="Same as pickup or a new address"
                  value={formData.dropoffLocation}
                  onChange={(e) => updateField("dropoffLocation", e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClassName}>
                    Start date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    End date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              {days > 0 && (
                <p className="text-sm text-smoke rounded border border-graphite px-3 py-2">
                  {days} day{days > 1 ? "s" : ""} · estimated total{" "}
                  <span className="font-normal text-chalk">
                    AED {total.toLocaleString()}
                  </span>
                </p>
              )}

              <h3 className="font-normal text-chalk pt-2">Contact info</h3>

              <div>
                <label className={labelClassName}>
                  Full name
                </label>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClassName}>
                    Phone
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+971 5X XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-chalk text-obsidian rounded-full py-2.5 text-sm font-normal uppercase tracking-wide mt-2 transition hover:bg-white"
              >
                Continue to documents
              </button>
            </form>
          )}

          {step === "documents" && (
            <form onSubmit={handleDocumentsSubmit} className="space-y-4">
              <h3 className="font-normal text-chalk">
                Driver&apos;s license &amp; ID
              </h3>
              <p className="text-sm text-smoke">
                Required by UAE rental regulations before pickup.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClassName}>
                    License number
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => updateField("licenseNumber", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    License expiry
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => updateField("licenseExpiry", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>
                  Emirates ID / Passport number
                </label>
                <input
                  required
                  type="text"
                  value={formData.emiratesIdOrPassport}
                  onChange={(e) =>
                    updateField("emiratesIdOrPassport", e.target.value)
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Upload driving license (front)
                </label>
                <input
                  required
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-smoke file:mr-3 file:rounded-full file:border file:border-graphite file:bg-transparent file:px-3 file:py-1.5 file:text-sm file:font-normal file:text-chalk"
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Upload Emirates ID / Passport
                </label>
                <input
                  required
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-smoke file:mr-3 file:rounded-full file:border file:border-graphite file:bg-transparent file:px-3 file:py-1.5 file:text-sm file:font-normal file:text-chalk"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex-1 rounded-full border border-graphite py-2.5 text-sm font-normal uppercase tracking-wide text-smoke transition hover:text-chalk"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-chalk text-obsidian rounded-full py-2.5 text-sm font-normal uppercase tracking-wide transition hover:bg-white"
                >
                  Continue to payment
                </button>
              </div>
            </form>
          )}

          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <h3 className="font-normal text-chalk">Payment</h3>

              <div className="rounded border border-graphite px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-smoke">Duration</span>
                  <span className="font-normal text-chalk">{days} day{days !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-smoke">Pickup</span>
                  <span className="font-normal text-chalk">{formData.pickupLocation}</span>
                </div>
                <div className="flex justify-between border-t border-graphite mt-2 pt-2">
                  <span className="text-smoke font-normal">Total due</span>
                  <span className="font-normal text-chalk">
                    AED {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-smoke">
                This is a demo checkout — no real card is charged.
              </p>

              <div>
                <label className={labelClassName}>
                  Card number
                </label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  value={cardDetails.cardNumber}
                  onChange={(e) =>
                    setCardDetails((p) => ({ ...p, cardNumber: e.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Name on card
                </label>
                <input
                  required
                  type="text"
                  value={cardDetails.cardName}
                  onChange={(e) =>
                    setCardDetails((p) => ({ ...p, cardName: e.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClassName}>
                    Expiry
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails((p) => ({ ...p, expiry: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    CVV
                  </label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails((p) => ({ ...p, cvv: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("documents")}
                  disabled={isProcessingPayment}
                  className="flex-1 rounded-full border border-graphite py-2.5 text-sm font-normal uppercase tracking-wide text-smoke transition hover:text-chalk disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="flex-1 bg-chalk text-obsidian rounded-full py-2.5 text-sm font-normal uppercase tracking-wide transition hover:bg-white disabled:bg-graphite disabled:text-iron"
                >
                  {isProcessingPayment
                    ? "Processing…"
                    : `Pay AED ${total.toLocaleString()}`}
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full border border-graphite flex items-center justify-center text-pulse text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-normal text-chalk">Booking confirmed</h3>
              <p className="text-sm text-smoke">
                Your {car.model} is reserved from {formData.startDate} to{" "}
                {formData.endDate}. A confirmation has been sent to{" "}
                {formData.email}.
              </p>
              <div className="rounded border border-graphite px-4 py-3 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-smoke">Amount paid</span>
                  <span className="font-normal text-chalk">
                    AED {total.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-chalk text-obsidian rounded-full py-2.5 text-sm font-normal uppercase tracking-wide mt-2 transition hover:bg-white"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
