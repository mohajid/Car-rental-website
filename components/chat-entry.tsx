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
      <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
        <div className="text-chalk">
          <p className="text-sm font-normal uppercase tracking-[0.18em] text-gold">
            Quicko AI Chat
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-normal tracking-tight md:text-6xl md:tracking-[-0.02em]">
            Start with your contact details.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-smoke">
            Quicko will use this information for booking follow-up, so the chat
            does not need to ask for your name, phone number, or Gmail again.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-graphite bg-carbon p-6 text-chalk md:p-8"
        >
          <h2 className="text-2xl font-normal">Before you chat</h2>
          <p className="mt-2 text-sm leading-6 text-smoke">
            Enter the details our team needs if you continue with a booking.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-normal text-smoke">Name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-2 w-full rounded border border-graphite bg-transparent px-4 py-3 text-chalk outline-none transition placeholder:text-iron focus:border-ash"
                placeholder="Your full name"
              />
            </label>

            <label className="block">
              <span className="text-sm font-normal text-smoke">
                Phone number
              </span>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="mt-2 w-full rounded border border-graphite bg-transparent px-4 py-3 text-chalk outline-none transition placeholder:text-iron focus:border-ash"
                placeholder="+971 50 000 0000"
                inputMode="tel"
              />
            </label>

            <label className="block">
              <span className="text-sm font-normal text-smoke">Gmail</span>
              <input
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="mt-2 w-full rounded border border-graphite bg-transparent px-4 py-3 text-chalk outline-none transition placeholder:text-iron focus:border-ash"
                placeholder="name@gmail.com"
                inputMode="email"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded border border-graphite bg-obsidian px-4 py-3 text-sm font-normal text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-chalk px-6 py-3 text-sm font-normal uppercase tracking-wide text-obsidian transition hover:bg-white"
          >
            Continue to Quicko
          </button>
        </form>
      </div>
    </section>
  );
}
