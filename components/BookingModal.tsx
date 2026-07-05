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

// Shared classes for every text input/date field in this modal. Text color
// and placeholder color are always set explicitly here — never left to
// inherit from the page body — because this modal is a white surface and
// the site's dark-mode text color (near-white) would otherwise make typed
// text and titles unreadable when the visitor's OS is in Dark Mode.
const inputClasses =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";
const labelClasses = "block text-sm font-semibold text-neutral-800 mb-1";
const fileInputClasses =
  "w-full text-sm text-neutral-700 file:mr-3 file:rounded-full file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-800";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        // Forces the browser's native form-control rendering (date pickers,
        // file inputs, etc.) to use its light-mode palette, regardless of
        // the visitor's OS dark-mode setting, since this modal is always
        // a light surface.
        style={{ colorScheme: "light" }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white text-neutral-900 shadow-xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {car.year} {car.model}
            </h2>
            <p className="text-sm text-neutral-600">{car.brand} · {car.category}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800 text-xl leading-none"
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
                className={`h-1.5 flex-1 rounded-full ${
                  ["details", "documents", "payment"].indexOf(step) >= i
                    ? "bg-blue-700"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        <div className="px-6 py-5">
          {step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <h3 className="font-semibold text-neutral-900">Trip details</h3>

              <div>
                <label className={labelClasses}>
                  Pickup location
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dubai Marina"
                  value={formData.pickupLocation}
                  onChange={(e) => updateField("pickupLocation", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Drop-off location
                </label>
                <input
                  required
                  type="text"
                  placeholder="Same as pickup or a new address"
                  value={formData.dropoffLocation}
                  onChange={(e) => updateField("dropoffLocation", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClasses}>
                    Start date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    End date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              {days > 0 && (
                <p className="text-sm text-neutral-700 bg-gray-50 rounded-lg px-3 py-2">
                  {days} day{days > 1 ? "s" : ""} · estimated total{" "}
                  <span className="font-semibold text-neutral-900">
                    AED {total.toLocaleString()}
                  </span>
                </p>
              )}

              <h3 className="font-semibold text-neutral-900 pt-2">Contact info</h3>

              <div>
                <label className={labelClasses}>
                  Full name
                </label>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClasses}>
                    Phone
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+971 5X XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 text-white rounded-full py-2.5 font-semibold mt-2"
              >
                Continue to documents
              </button>
            </form>
          )}

          {step === "documents" && (
            <form onSubmit={handleDocumentsSubmit} className="space-y-4">
              <h3 className="font-semibold text-neutral-900">
                Driver&apos;s license &amp; ID
              </h3>
              <p className="text-sm text-neutral-600">
                Required by UAE rental regulations before pickup.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClasses}>
                    License number
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => updateField("licenseNumber", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    License expiry
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => updateField("licenseExpiry", e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>
                  Emirates ID / Passport number
                </label>
                <input
                  required
                  type="text"
                  value={formData.emiratesIdOrPassport}
                  onChange={(e) =>
                    updateField("emiratesIdOrPassport", e.target.value)
                  }
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Upload driving license (front)
                </label>
                <input
                  required
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
                  className={fileInputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Upload Emirates ID / Passport
                </label>
                <input
                  required
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                  className={fileInputClasses}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex-1 rounded-full border border-gray-300 py-2.5 font-semibold text-neutral-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-700 text-white rounded-full py-2.5 font-semibold"
                >
                  Continue to payment
                </button>
              </div>
            </form>
          )}

          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <h3 className="font-semibold text-neutral-900">Payment</h3>

              <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Duration</span>
                  <span className="font-medium text-neutral-900">{days} day{days !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Pickup</span>
                  <span className="font-medium text-neutral-900">{formData.pickupLocation}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 mt-2 pt-2">
                  <span className="text-neutral-800 font-semibold">Total due</span>
                  <span className="font-bold text-neutral-900">
                    AED {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-500">
                This is a demo checkout — no real card is charged.
              </p>

              <div>
                <label className={labelClasses}>
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
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Name on card
                </label>
                <input
                  required
                  type="text"
                  value={cardDetails.cardName}
                  onChange={(e) =>
                    setCardDetails((p) => ({ ...p, cardName: e.target.value }))
                  }
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClasses}>
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
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>
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
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("documents")}
                  disabled={isProcessingPayment}
                  className="flex-1 rounded-full border border-gray-300 py-2.5 font-semibold text-neutral-800 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="flex-1 bg-blue-700 text-white rounded-full py-2.5 font-semibold disabled:bg-blue-300"
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
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Booking confirmed</h3>
              <p className="text-sm text-neutral-600">
                Your {car.model} is reserved from {formData.startDate} to{" "}
                {formData.endDate}. A confirmation has been sent to{" "}
                {formData.email}.
              </p>
              <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Amount paid</span>
                  <span className="font-semibold text-neutral-900">
                    AED {total.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-blue-700 text-white rounded-full py-2.5 font-semibold mt-2"
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
