"use client";

import type { Car } from "@/data/cars";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/chat-i18n";

type Message = {
  role: "user" | "assistant";
  text: string;
  cars?: Car[];
  payment?: boolean;
  options?: string[];
};

type ChatResponse = {
  reply?: string;
  cars?: Car[];
  payment?: boolean;
  options?: string[];
  language?: Lang;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
};

function getFallbackCarImage(category: string) {
  if (category === "SUV" || category === "7-seater") {
    return "/cars/creta.svg";
  }

  if (category === "Sedan" || category === "Luxury") {
    return "/cars/sunny.svg";
  }

  return "/cars/yaris.svg";
}

function ChatCarImage({ car }: { car: Car }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageFailed ? getFallbackCarImage(car.category) : car.image}
      alt={`${car.year} ${car.model}`}
      className="h-36 w-full object-cover"
      onError={() => setImageFailed(true)}
    />
  );
}

function ChatCarCard({ car }: { car: Car }) {
  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative">
        <ChatCarImage car={car} />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${
            car.available ? "bg-emerald-600 text-white" : "bg-gray-900 text-white"
          }`}
        >
          {car.available ? "Available" : "Booked"}
        </span>
      </div>

      <div className="space-y-3 p-4 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#1175ff]">{car.category}</p>
            <h4 className="mt-1 text-lg font-bold text-neutral-900">{car.model}</h4>
          </div>
          <p className="shrink-0 font-semibold text-gray-500">{car.year}</p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-gray-700">
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Brand</dt>
            <dd>{car.brand}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Daily</dt>
            <dd>AED {car.pricing.daily}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Weekly</dt>
            <dd>AED {car.pricing.weekly}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-400">Monthly</dt>
            <dd>AED {car.pricing.monthly}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-1.5">
          {car.features.map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function PaymentGateway() {
  const [method, setMethod] = useState<"apple-pay" | "card">("apple-pay");
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <p className="text-lg font-bold">Payment request received</p>
        <p className="mt-2 text-sm leading-6">
          Thanks. This demo checkout has recorded the request. In production,
          this should connect to your certified payment provider before taking
          real card payments.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-white text-neutral-950 shadow-sm">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-5 text-white">
        <p className="text-sm font-bold uppercase tracking-[0.16em]">
          Secure checkout
        </p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-black">AED 500.00</p>
            <p className="mt-1 text-sm text-blue-100">
              Booking deposit / verification hold
            </p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            Demo
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMethod("apple-pay")}
            className={`rounded-xl border px-4 py-3 text-left font-bold transition ${
              method === "apple-pay"
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-gray-200 bg-white text-neutral-900"
            }`}
          >
            Apple Pay
          </button>
          <button
            type="button"
            onClick={() => setMethod("card")}
            className={`rounded-xl border px-4 py-3 text-left font-bold transition ${
              method === "card"
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-gray-200 bg-white text-neutral-900"
            }`}
          >
            Card
          </button>
        </div>

        {method === "apple-pay" ? (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setPaid(true)}
              className="w-full rounded-xl bg-black px-5 py-4 text-lg font-bold text-white transition hover:bg-neutral-800"
            >
              Pay with Apple Pay
            </button>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              Apple Pay availability depends on device, browser, and the live
              payment provider setup.
            </p>
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setPaid(true);
            }}
          >
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Card number
              </span>
              <input
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                autoComplete="cc-number"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Expiry
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="MM / YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">CVC</span>
                <input
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Name on card
              </span>
              <input
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                placeholder="Cardholder name"
                autoComplete="cc-name"
              />
            </label>

            <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              Demo only: this form is a payment gateway mockup. Connect Stripe,
              Checkout.com, Network, Telr, or another certified provider before
              collecting real card details.
            </p>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-900"
            >
              Pay securely
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

async function readChatResponse(res: Response) {
  const responseText = await res.text();

  if (!responseText.trim()) {
    return {} as ChatResponse;
  }

  try {
    return JSON.parse(responseText) as ChatResponse;
  } catch {
    return {
      reply: res.ok
        ? undefined
        : "Sorry, the chat service returned an invalid response. Please try again.",
    };
  }
}

function getGreeting(customer?: CustomerInfo): Message {
  const text = customer
    ? `Hi ${customer.name}, I'm Quicko from QUICK AND EASY. I already have your phone number and Gmail for follow-up. Which emirate or pickup location do you need?`
    : "Hi, I'm Quicko from QUICK AND EASY. Which emirate or pickup location do you need?";

  return {
    role: "assistant",
    text,
    options: [
      "Abu Dhabi",
      "Dubai",
      "Sharjah",
      "Ras Al-Khaimah",
      "Al Ain",
      "Fujairah",
      "Ajman",
    ],
  };
}

export default function Chatbot({ customer }: { customer?: CustomerInfo }) {
  // Tracks whichever language the bot last replied in, so the UI (text
  // direction, placeholder, etc.) follows automatically — no toggle needed.
  const [currentLang, setCurrentLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<Message[]>([getGreeting(customer)]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  const quickOptions = useMemo(() => lastAssistantMessage?.options ?? [], [lastAssistantMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = messageText.trim();
    const nextMessages: Message[] = [
      ...messages,
      { role: "user", text: userMessage },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          messages: nextMessages,
          customer,
        }),
      });

      const data = await readChatResponse(res);

      if (!res.ok) {
        throw new Error(data.reply || "Chat request failed");
      }

      if (data.language) {
        setCurrentLang(data.language);
      }

      setMessages((prev) => {
        const next: Message[] = [
          ...prev,
          {
            role: "assistant",
            text: data.reply || "Sorry, I could not generate a response.",
            cars: data.cars ?? [],
            options: data.options ?? [],
          },
        ];

        if (data.payment) {
          next.push({
            role: "assistant",
            text: "Your booking details and documents are ready for review. You can now continue with secure payment below.",
            payment: true,
          });
        }

        return next;
      });
    } catch (error) {
      console.error("Chat request failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            currentLang === "ar"
              ? "عذرًا، حدث خطأ ما. الرجاء المحاولة مرة أخرى."
              : "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = (files: FileList | null) => {
    if (!files?.length || loading) return;

    const pdfFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            currentLang === "ar"
              ? "الرجاء رفع ملفات PDF فقط لمستندات التحقق."
              : "Please upload PDF files only for verification documents.",
        },
      ]);
      return;
    }

    const fileNames = pdfFiles.map((file) => file.name).join(", ");
    sendMessage(
      currentLang === "ar" ? `تم رفع مستندات PDF: ${fileNames}` : `Uploaded PDF documents: ${fileNames}`
    );

    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  return (
    <section
      id="chatbot"
      className="bg-black/45 px-4 py-12 text-[#0b0f53] md:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center text-white">
          <p className="text-4xl font-semibold">السلام</p>
          <h2 className="mt-5 text-3xl font-bold md:text-4xl">
            Reserve With AI
          </h2>
        </div>

        <div className="mx-auto max-w-6xl">
          <div dir={currentLang === "ar" ? "rtl" : "ltr"}>
            <div className="min-h-[520px] rounded-3xl bg-[#f7f8fb] p-5 shadow-xl md:p-8">
              <div className="h-[440px] overflow-y-auto pr-1">
                <div className="space-y-5">
                  {messages.map((msg, index) => (
                    <div
                      key={`${msg.role}-${index}`}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="mr-2 mt-2 h-5 w-7 shrink-0 bg-red-600 [clip-path:polygon(0_0,70%_0,100%_50%,70%_100%,0_100%,22%_50%)]" />
                      )}

                      <div
                        className={`max-w-[88%] rounded-lg px-5 py-4 text-lg leading-relaxed shadow-sm ${
                          msg.role === "user"
                            ? "bg-[#1175ff] text-white"
                            : "border border-gray-200 bg-white text-neutral-800"
                        }`}
                      >
                        {msg.text.split("\n").map((line, lineIndex) => (
                          <p key={`${index}-${lineIndex}`} className="mb-2 last:mb-0">
                            {line}
                          </p>
                        ))}

                        {msg.role === "assistant" && msg.cars && msg.cars.length > 0 && (
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {msg.cars.map((car) => (
                              <ChatCarCard key={car.id} car={car} />
                            ))}
                          </div>
                        )}

                        {msg.role === "assistant" && msg.payment && (
                          <PaymentGateway />
                        )}
                      </div>
                    </div>
                  ))}

                  {quickOptions.length > 0 && !loading && (
                    <div className="ml-10 flex flex-wrap gap-2">
                      {quickOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => sendMessage(option)}
                          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-base font-semibold text-[#08007a] shadow-sm transition hover:bg-[#08007a] hover:text-white"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="mr-2 mt-2 h-5 w-7 shrink-0 bg-red-600 [clip-path:polygon(0_0,70%_0,100%_50%,70%_100%,0_100%,22%_50%)]" />
                      <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 text-lg text-gray-500 shadow-sm">
                        Thinking...
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center rounded-full border-4 border-[#1175ff] bg-white p-2 shadow-xl">
              <input
                ref={documentInputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden"
                onChange={(event) => handleDocumentUpload(event.target.files)}
              />

              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                disabled={loading}
                className="mr-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-[#08007a] transition hover:bg-gray-100 disabled:text-gray-400"
              >
                Upload PDFs
              </button>

              <input
                className="min-w-0 flex-1 rounded-full px-4 py-3 text-lg outline-none"
                placeholder={currentLang === "ar" ? "اكتب رسالتك" : "Type your message"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button
                onClick={() => sendMessage()}
                disabled={loading}
                aria-label="Send message"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4338f2] text-2xl text-white shadow-md transition hover:bg-[#2f28c8] disabled:bg-gray-400"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
