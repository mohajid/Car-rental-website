"use client";

import Chatbot, { type CustomerInfo } from "@/components/chatbot";
import type { FormEvent } from "react";
import { useState } from "react";

const initialForm = {
  name: "",
  phone: "",
  email: "",
};

function isGmailAddress(value: string) {
  return /^[^\s@]+@gmail\.com$/i.test(value.trim());
}

export default function ChatEntry() {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextCustomer = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
    };

    if (!nextCustomer.name) {
      setError("Please enter your name.");
      return;
    }

    if (!/^\+?[0-9\s-]{7,18}$/.test(nextCustomer.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!isGmailAddress(nextCustomer.email)) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    setError("");
    setCustomer(nextCustomer);
  };

  if (customer) {
    return <Chatbot customer={customer} />;
  }

  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
        <div className="text-white">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">
            Quicko AI Chat
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
            Start with your contact details.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            Quicko will use this information for booking follow-up, so the chat
            does not need to ask for your name, phone number, or Gmail again.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 text-neutral-950 shadow-2xl md:p-8"
        >
          <h2 className="text-2xl font-bold">Before you chat</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Enter the details our team needs if you continue with a booking.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                placeholder="Your full name"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Phone number
              </span>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                placeholder="+971 50 000 0000"
                inputMode="tel"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Gmail</span>
              <input
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                placeholder="name@gmail.com"
                inputMode="email"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-900"
          >
            Continue to Quicko
          </button>
        </form>
      </div>
    </section>
  );
}
