"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const cityOptions = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ras Al-Khaimah",
  "Al Ain",
  "Fujairah",
  "Ajman",
];

const durationOptions = [
  "1 Day",
  "3 Days",
  "1 Week",
  "1 Month",
  "3 Months",
  "6 Months",
  "12 Months",
];

const budgetOptions = [
  "Under AED 100/day",
  "AED 100-200/day",
  "AED 200-350/day",
  "Monthly budget",
];

const carTypeOptions = ["Economy", "Sedan", "SUV", "Luxury", "7-seater", "Monthly rental"];

const bookingSteps = [
  "Location Selected",
  "Car & Delivery",
  "Select Insurance",
  "Make Payment",
];

function getQuickOptions(message?: string) {
  const text = message?.toLowerCase() ?? "";

  if (text.includes("where") || text.includes("city") || text.includes("pick up")) {
    return cityOptions;
  }

  if (text.includes("how long") || text.includes("duration") || text.includes("dates")) {
    return durationOptions;
  }

  if (text.includes("budget") || text.includes("price")) {
    return budgetOptions;
  }

  if (text.includes("secure checkout") || text.includes("payment")) {
    return ["Proceed to secure payment"];
  }

  if (
    text.includes("vehicle type") ||
    text.includes("car type") ||
    text.includes("type of car") ||
    text.includes("prefer")
  ) {
    return carTypeOptions;
  }

  return [];
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi, I'm Quicko from QUICK AND EASY. Which emirate or pickup location do you need?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  const quickOptions = useMemo(
    () => getQuickOptions(lastAssistantMessage?.text),
    [lastAssistantMessage?.text]
  );

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
        }),
      });

      const data = (await res.json()) as { reply?: string };

      if (!res.ok) {
        throw new Error(data.reply || "Chat request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "Sorry, I could not generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
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
          text: "Please upload PDF files only for verification documents.",
        },
      ]);
      return;
    }

    const fileNames = pdfFiles.map((file) => file.name).join(", ");
    sendMessage(`Uploaded PDF documents: ${fileNames}`);

    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  return (
    <section
      id="chatbot"
      className="bg-[#0b1230] px-4 py-12 text-[#0b0f53] md:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center text-white">
          <p className="text-4xl font-semibold">السلام</p>
          <h2 className="mt-5 text-3xl font-bold md:text-4xl">
            Reserve With AI
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-2xl font-bold">Booking Steps</h3>

              <div className="mt-8 space-y-7">
                {bookingSteps.map((step, index) => {
                  const isCurrent = index === 1;
                  const isDone = index === 0;

                  return (
                    <div key={step} className="flex items-center gap-4">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                          isCurrent
                            ? "bg-[#08007a] text-white"
                            : isDone
                              ? "bg-[#7773bd] text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`text-lg font-semibold ${
                          isCurrent
                            ? "text-[#08007a]"
                            : isDone
                              ? "text-[#7773bd]"
                              : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>
                      {isDone && (
                        <span className="ml-auto text-2xl text-[#7773bd]">
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-xl">
              <h3 className="text-2xl font-bold">Exclusive Offers!</h3>
              <div className="mt-5 rounded-xl bg-gradient-to-r from-slate-100 to-blue-100 p-5">
                <p className="inline-block bg-red-600 px-2 py-1 text-xs font-bold text-white">
                  LIMITED STOCK
                </p>
                <p className="mt-4 text-3xl font-black text-[#11185f]">
                  2026 FLAT RATE
                </p>
                <p className="mt-1 text-lg font-bold text-[#11185f]">
                  3, 6 & 12 months
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-fuchsia-500 bg-[#2f2f2f] p-6 text-white shadow-xl">
              <p className="text-xl font-bold text-amber-400">Ahlam S.</p>
              <p className="mt-2 text-sm leading-relaxed">
                Reserved <strong>Hyundai Accent 2026</strong> for{" "}
                <strong>12 months</strong>
              </p>
            </div>
          </aside>

          <div>
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
                placeholder="Type your message"
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
