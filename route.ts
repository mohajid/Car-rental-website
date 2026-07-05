import { cars, type Car } from "@/data/cars";
import { GoogleGenAI, Type, FunctionCallingConfigMode, type Content } from "@google/genai";
import { detectLanguage, type Lang } from "@/lib/chat-i18n";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type CustomerInfo = {
  name?: string;
  phone?: string;
  email?: string;
};

// ---------------------------------------------------------------------------
// Real inventory search — this is what the model calls instead of inventing
// cars, prices, or availability. It only ever returns what's actually in
// data/cars.ts.
// ---------------------------------------------------------------------------

type SearchCarsArgs = {
  category?: string;
  max_daily_price_aed?: number;
  min_seats?: number;
  keyword?: string;
};

function getSeatCount(features: string[]) {
  const seatFeature = features.find((f) => /seats?$/i.test(f.trim()));
  const match = seatFeature?.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

function searchCars(args: SearchCarsArgs): Car[] {
  const normalizedKeyword = args.keyword?.toLowerCase().trim();

  const matches = cars.filter((car) => {
    if (args.category && car.category.toLowerCase() !== args.category.toLowerCase()) {
      return false;
    }

    if (args.max_daily_price_aed && car.pricing.daily > args.max_daily_price_aed) {
      return false;
    }

    if (args.min_seats) {
      const seats = getSeatCount(car.features);
      if (!seats || seats < args.min_seats) return false;
    }

    if (normalizedKeyword) {
      const haystack = `${car.brand} ${car.model}`.toLowerCase();
      if (!haystack.includes(normalizedKeyword)) return false;
    }

    return true;
  });

  // Prefer available cars first, but still show unavailable ones if that's
  // all that matches, so the assistant can say "currently booked" honestly
  // instead of claiming nothing exists.
  const available = matches.filter((car) => car.available);
  const ranked = available.length ? available : matches;

  return ranked.slice(0, 6);
}

function carToSearchResult(car: Car) {
  return {
    id: car.id,
    model: car.model,
    brand: car.brand,
    year: car.year,
    category: car.category,
    daily_price_aed: car.pricing.daily,
    weekly_price_aed: car.pricing.weekly,
    monthly_price_aed: car.pricing.monthly,
    features: car.features,
    available: car.available,
  };
}

// ---------------------------------------------------------------------------
// Tool declarations given to Gemini
// ---------------------------------------------------------------------------

const searchCarsDeclaration = {
  name: "search_cars",
  description:
    "Search the real rental inventory. Call this whenever the customer wants to see cars, asks what's available, asks about pricing for a type of car, or wants recommendations. Always call this before naming specific cars, prices, or availability — never invent them.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description:
          "Filter by category: Economy, Sedan, SUV, Luxury, Electric, Sports, or Hatchback. Omit to search all categories.",
      },
      max_daily_price_aed: {
        type: Type.NUMBER,
        description: "Maximum daily rate in AED the customer will accept.",
      },
      min_seats: {
        type: Type.NUMBER,
        description: "Minimum seats required, e.g. 7 for a 7-seater request.",
      },
      keyword: {
        type: Type.STRING,
        description: "A specific brand or model the customer named, e.g. 'Mini Cooper' or 'Tesla'.",
      },
    },
  },
};

const showCheckoutDeclaration = {
  name: "show_secure_checkout",
  description:
    "Call this only when the customer has picked a specific car, you have their contact details, and they have confirmed they are ready to pay or asked to proceed to checkout. This only displays the secure payment panel in the UI — it does not charge anything itself. Never call this just because a car was mentioned.",
  parameters: { type: Type.OBJECT, properties: {} },
};

// ---------------------------------------------------------------------------
// System prompt (adapted from the "Rima" brief) with language + guardrails
// ---------------------------------------------------------------------------

function buildSystemPrompt(lang: Lang, customer?: CustomerInfo) {
  const languageLine =
    lang === "ar"
      ? "The customer is writing in Arabic. Reply in Modern Standard Arabic, regardless of which language earlier messages used."
      : "The customer is writing in English. Reply in English, regardless of which language earlier messages used.";

  const customerLine = customer?.phone
    ? `The customer already provided contact details before this chat: name "${customer.name ?? "unknown"}", phone ${customer.phone}, email ${customer.email ?? "unknown"}. Do not ask for these again unless they want to change them.`
    : "No pre-chat contact details were provided. You may ask for a WhatsApp number when it's relevant to move a booking forward.";

  return `
# ROLE
You are "Rima," the AI rental assistant for QUICK AND EASY, a car rental service operating in the UAE (Dubai, Abu Dhabi, Sharjah, and other emirates). You help customers browse vehicles, understand pricing and requirements, and move toward a booking — or hand off cleanly to a human agent when needed.

# TOP PRIORITY
Always answer the customer's actual question first, in whatever order they ask things. Do not force a fixed script (e.g. "location, then date, then car type..."). If they jump straight to "show me SUVs" or "what's your cheapest car," answer that immediately by calling search_cars. Only ask a follow-up question when you genuinely need one more detail to help them.

# LANGUAGE & TONE
${languageLine}
- Tone: warm, professional, concise. Short sentences. No corporate filler like "We value you as a customer."
- All pricing in AED, never USD.
- Multicultural customer base (tourists, residents, business travelers) — don't assume local knowledge.

# CUSTOMER CONTEXT
${customerLine}

# TOOLS
- search_cars: your only source of real car names, prices, and availability. Call it whenever cars, pricing, or availability come up. Never invent a car, price, or availability status — if you haven't called search_cars in this turn or a recent one, call it before answering.
- show_secure_checkout: call only when the customer has a chosen car and clearly wants to pay/checkout now. This just opens the UI payment panel — you never collect or process card details in chat.

# CORE INFORMATION YOU CAN SHARE
- Insurance tiers: basic (CDW) vs. full/zero-excess coverage. Ask which tier they want if it matters to their question, but don't block other answers on it.
- Eligibility:
  - UAE residents: valid UAE driving license + Emirates ID.
  - GCC nationals: GCC driving license accepted directly.
  - Tourists: passport + visa + home country license. Some nationalities also need an International Driving Permit — flag this as something to confirm with the team rather than guessing which nationalities.
  - Minimum age is typically 21-25 depending on car category — say "typically" and defer exact cutoffs to the team.
- Salik/tolls, parking fines: usually charged to the renter based on actual usage; team confirms exact charges.
- Fuel policy: usually return-at-same-level or prepaid if offered; confirm exact policy before payment.
- Cross-border driving (Oman, Saudi): needs current approval/permits you cannot confirm in chat — always say the team must check this before booking.

# DOCUMENTS BEFORE CHECKOUT
Before calling show_secure_checkout, you must first ask whether the customer is a UAE resident or a tourist (if they've already told you, don't ask again), then ask them to upload the matching documents using the Upload PDFs button:
- Resident: UAE driving license + Emirates ID.
- Tourist: visit visa + International Driving Permit.
Wait for them to confirm the upload before moving to checkout. Only call show_secure_checkout once residency status is known and the matching documents have been requested and uploaded.

# WHAT YOU MUST NOT DO
- Never call show_secure_checkout before residency status is known and the matching documents have been requested and uploaded.
- Never invent specific prices, availability, or policy numbers (deposits, exact age cutoffs, exact fines) — say you'll confirm with the team instead of guessing.
- Never say a booking is final — frame it as "here's a summary, want me to open checkout?" until show_secure_checkout has actually been shown.
- Never ask for or accept card details as chat text.
- Never promise cross-border driving is allowed without flagging it needs team confirmation.

# ESCALATION
Say plainly that you're connecting them to the team (and that the team typically follows up soon) when:
- There's a complaint, accident, dispute, or refund issue.
- It involves cross-border authorization, corporate/long-term leasing, or a below-minimum-age exception.
- They explicitly ask for a human.
- You're not confident in an eligibility/legal answer — never guess there.

# OUTPUT STYLE
- Keep replies short and scannable. Use bullet points for lists of requirements or details.
- When search_cars returns results, don't retype a full car-by-car spec sheet in text — the UI already shows car cards with image, price, and a Select button. Just introduce them briefly (e.g. "Here are a few options:") and ask a short next-step question.
- End most turns with one clear next-step question, not an open-ended "let me know if you need anything else."
`.trim();
}

function isRetryableGeminiError(error: unknown) {
  const status = (error as { status?: number; response?: { status?: number } })?.status
    ?? (error as { response?: { status?: number } })?.response?.status;

  return status === 503 || status === 429 || status === 500;
}

async function generateWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0],
  attempts = 2
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      lastError = error;
      console.error(`Gemini generateContent failed (attempt ${attempt + 1}/${attempts}):`, error);

      if (attempt < attempts - 1 && isRetryableGeminiError(error)) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim().replace(/^['"]|['"]$/g, "");
  return apiKey?.startsWith("AIza") ? apiKey : undefined;
}

function toGeminiContents(messages: ChatMessage[], currentMessage: string): Content[] {
  const contents: Content[] = messages.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.text }],
  }));

  const last = contents.at(-1);
  const alreadyIncludesCurrent = last?.role === "user" && last.parts?.[0]?.text?.trim() === currentMessage.trim();

  if (!alreadyIncludesCurrent) {
    contents.push({ role: "user", parts: [{ text: currentMessage }] });
  }

  return contents;
}

async function runAssistant(message: string, messages: ChatMessage[], lang: Lang, customer?: CustomerInfo) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      reply:
        lang === "ar"
          ? "عذرًا، مساعد الدردشة غير متصل حاليًا. الرجاء المحاولة لاحقًا أو التواصل مع فريقنا مباشرة."
          : "Sorry, the chat assistant is temporarily offline. Please try again shortly or contact our team directly.",
      cars: [] as Car[],
      payment: false,
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = buildSystemPrompt(lang, customer);
  const contents = toGeminiContents(messages, message);
  const config = {
    systemInstruction,
    tools: [{ functionDeclarations: [searchCarsDeclaration, showCheckoutDeclaration] }],
    toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
  };

  let first;
  try {
    first = await generateWithRetry(ai, {
      model: "gemini-2.5-flash-lite",
      contents,
      config,
    });
  } catch (error) {
    console.error("Gemini first call failed after retries:", error);
    return {
      reply:
        lang === "ar"
          ? "الخدمة مشغولة قليلًا الآن. الرجاء المحاولة مرة أخرى خلال لحظات."
          : "The assistant is a little busy right now. Please try again in a moment.",
      cars: [] as Car[],
      payment: false,
    };
  }

  const calls = first.functionCalls ?? [];
  let matchedCars: Car[] = [];
  let payment = false;

  if (calls.length === 0) {
    return { reply: first.text?.trim() || "", cars: matchedCars, payment };
  }

  // Execute whichever real functions the model asked for, then give it the
  // results so it can write a grounded final reply.
  const followUpContents: Content[] = [
    ...contents,
    { role: "model", parts: calls.map((call) => ({ functionCall: call })) },
  ];

  const functionResponseParts = calls.map((call) => {
    if (call.name === "search_cars") {
      const results = searchCars((call.args ?? {}) as SearchCarsArgs);
      matchedCars = results;

      return {
        functionResponse: {
          name: call.name,
          response: { results: results.map(carToSearchResult) },
        },
      };
    }

    if (call.name === "show_secure_checkout") {
      payment = true;

      return {
        functionResponse: {
          name: call.name,
          response: { output: "Secure checkout panel is now shown to the customer." },
        },
      };
    }

    return {
      functionResponse: {
        name: call.name ?? "unknown_function",
        response: { output: "Function not recognized." },
      },
    };
  });

  followUpContents.push({ role: "user", parts: functionResponseParts });

  let second;
  try {
    second = await generateWithRetry(ai, {
      model: "gemini-2.5-flash-lite",
      contents: followUpContents,
      config,
    });
  } catch (error) {
    console.error("Gemini second call failed after retries:", error);
    // We still have real search results even if the follow-up write-up failed,
    // so fall back to the first draft rather than losing the car results.
    return { reply: first.text?.trim() || "", cars: matchedCars, payment };
  }

  return { reply: second.text?.trim() || first.text?.trim() || "", cars: matchedCars, payment };
}

export async function POST(req: Request) {
  try {
    const { message, messages = [], customer } = (await req.json()) as {
      message: string;
      messages?: ChatMessage[];
      customer?: CustomerInfo;
    };

    const lang = detectLanguage(message);

    if (!message?.trim()) {
      return Response.json({
        reply: lang === "ar" ? "الرجاء كتابة رسالة حتى أتمكن من مساعدتك في الحجز." : "Please type a message so I can help with your rental.",
        language: lang,
      });
    }

    const { reply, cars: matchedCars, payment } = await runAssistant(message, messages, lang, customer);

    return Response.json({
      reply: reply || (lang === "ar" ? "عذرًا، لم أتمكن من إنشاء رد. الرجاء المحاولة مرة أخرى." : "Sorry, I could not generate a response. Please try again."),
      cars: matchedCars,
      payment,
      language: lang,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { reply: "Sorry, I could not read that message. Please try again." },
      { status: 500 }
    );
  }
}