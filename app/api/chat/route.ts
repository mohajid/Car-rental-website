import { cars, type Car } from "@/data/cars";
import { GoogleGenAI } from "@google/genai";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type CustomerInfo = {
  name?: string;
  phone?: string;
  email?: string;
};

type BookingState = {
  location?: string;
  pickupDate?: string;
  duration?: string;
  selectedCar?: Car;
  carType?: string;
  budget?: string;
  contactReady: boolean;
  residencyStatus?: string;
  insurancePreference?: string;
  documentsUploaded?: string;
  paymentIntent?: string;
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

const carTypeOptions = [
  "Economy",
  "Sedan",
  "SUV",
  "Luxury",
  "Electric",
  "Sports",
  "Hatchback",
  "7-seater",
  "Monthly rental",
];

const pickupDurationOptions = [
  "Tomorrow for 1 day",
  "Tomorrow for 3 days",
  "Tomorrow for 5 days",
  "Next week for 1 week",
];

const insuranceOptions = [
  "Basic insurance, no add-ons",
  "Full coverage / zero excess",
  "No upgraded insurance or add-ons",
  "Ask team to confirm insurance",
];

const residencyOptions = ["UAE resident", "Tourist", "GCC national"];

const cityAliases: Record<string, string[]> = {
  "Abu Dhabi": ["abu dhabi", "abudhabi", "auh"],
  Dubai: ["dubai", "dxb"],
  Sharjah: ["sharjah", "shj"],
  "Ras Al-Khaimah": ["ras al-khaimah", "ras al khaimah", "rak"],
  "Al Ain": ["al ain"],
  Fujairah: ["fujairah"],
  Ajman: ["ajman"],
};

const carTypeAliases: Record<string, string[]> = {
  Economy: ["economy", "budget", "cheap", "small"],
  Sedan: ["sedan", "saloon"],
  SUV: ["suv", "4x4"],
  Luxury: ["luxury", "premium", "benz", "mercedes", "range rover", "lamborghini"],
  Electric: ["electric", "ev", "tesla"],
  Sports: ["sports", "sport", "mustang", "porsche"],
  Hatchback: ["hatchback", "compact", "mini cooper", "mini"],
  "7-seater": ["7-seater", "7 seater", "seven seater", "7 seats", "seven seats"],
  "Monthly rental": ["monthly rental", "monthly", "month"],
};

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim().replace(/^['"]|['"]$/g, "");

  return apiKey?.startsWith("AIza") ? apiKey : undefined;
}

function getUserMessages(messages: ChatMessage[], currentMessage: string) {
  const history = messages.filter((item) => item.role === "user").map((item) => item.text);

  if (history.at(-1)?.trim() !== currentMessage.trim()) {
    history.push(currentMessage);
  }

  return history;
}

function includesAny(text: string, terms: string[]) {
  const normalized = text.toLowerCase();

  return terms.some((term) => normalized.includes(term));
}

function findAliasMatch(aliases: Record<string, string[]>, messages: string[]) {
  return messages.reduce<string | undefined>((match, text) => {
    if (match) return match;

    const normalized = text.toLowerCase();
    return Object.entries(aliases).find(([, terms]) =>
      terms.some((term) => normalized.includes(term))
    )?.[0];
  }, undefined);
}

function findFirstMatch(values: string[], messages: string[]) {
  return messages.reduce<string | undefined>((match, text) => {
    if (match) return match;

    const normalized = text.toLowerCase();
    return values.find((value) => normalized.includes(value.toLowerCase()));
  }, undefined);
}

function findPickupDate(messages: string[]) {
  return messages.find((text) =>
    /\b(today|tomorrow|tonight|next\s+week|next\s+month|this\s+weekend|weekend|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(
      text
    )
  );
}

function findDuration(messages: string[]) {
  return messages.find((text) =>
    /\b(\d{1,2}\s*days?|one\s+day|two\s+days?|three\s+days?|four\s+days?|five\s+days?|six\s+days?|seven\s+days?|week|weeks|month|months|year|years)\b/i.test(text)
  );
}

function findBudget(messages: string[]) {
  return messages.find((text) =>
    /\b(aed|budget|under|\d+\s*(?:-|to)\s*\d+|\d+\s*(?:\/day|daily|per day|month|monthly))\b/i.test(
      text
    )
  );
}

function findWhatsApp(messages: string[]) {
  return messages.find((text) => /(?:\+?\d[\s-]?){7,}/.test(text));
}

function findResidencyStatus(messages: string[]) {
  return messages.find((text) =>
    /\b(uae resident|resident|gcc national|gcc|tourist|visitor|visit visa)\b/i.test(text)
  );
}

function findInsurancePreference(messages: string[]) {
  return messages.find((text) =>
    /\b(no insurance|without insurance|dont want insurance|don't want insurance|do not want insurance|no upgraded insurance|basic|standard|full coverage|full insurance|upgraded coverage|zero excess|insurance upgrade|cdw|child seat|baby seat|gps|additional driver|home delivery|car delivery|deliver to|delivery service|drop-off service|drop off service|no add-ons|no addons|no extras|none needed|no thanks|ask the team|confirm insurance|confirm it)\b/i.test(
      text
    )
  );
}

function findDocumentUpload(messages: string[]) {
  return messages.find((text) =>
    /\b(uploaded pdf documents|documents uploaded|pdf documents|driving license pdf|driving licence pdf|emirates id pdf|passport pdf|visa pdf|pdf uploaded)\b/i.test(
      text
    )
  );
}

function findPaymentIntent(messages: string[]) {
  return messages.find((text) =>
    /\b(proceed to secure payment|secure payment|secure checkout|checkout|pay now|payment panel)\b/i.test(
      text
    )
  );
}

function isPaymentMethodQuestion(text: string) {
  return (
    /\b(cash|cashh|card|crd|credit card|debit card|apple pay|google pay|payment|paymnt|payment method|paymnt methd|pay in cash|pay cash|pay by cash|py by crd|deposit|deposite|security deposit|advance payment)\b/i.test(
      text
    ) ||
    /\b(?:do|can|should|must|need)\s+i\s+(?:need\s+to\s+)?pay\b/i.test(text)
  );
}

function getDailyBudgetMax(budget?: string) {
  if (!budget) return undefined;

  const normalized = budget.toLowerCase();
  const range = normalized.match(/(\d+)\s*(?:-|to)\s*(\d+)/);
  const under = normalized.match(/under\s*(?:aed\s*)?(\d+)/);
  const singleDaily = normalized.match(/(?:aed\s*)?(\d+)\s*(?:\/day|daily|per day)/);

  if (range) return Number(range[2]);
  if (under) return Number(under[1]);
  if (singleDaily) return Number(singleDaily[1]);

  return undefined;
}

function getCarTransmission(features: string[]) {
  return features.find((feature) => ["Automatic", "Manual"].includes(feature));
}

function getCarSeats(features: string[]) {
  return features.find((feature) => feature.includes("Seats"));
}

function getFallbackOptions(carType?: string, dailyBudgetMax?: number) {
  const preferredCategory =
    carType && !["Monthly rental", "7-seater"].includes(carType) ? carType : undefined;
  const needsSevenSeats = carType === "7-seater";

  const exactMatches = cars.filter(
    (car) =>
      (!preferredCategory || car.category === preferredCategory) &&
      (!needsSevenSeats || car.features.includes("7 Seats")) &&
      (!dailyBudgetMax || car.pricing.daily <= dailyBudgetMax) &&
      car.available
  );

  const relaxedMatches = cars.filter(
    (car) =>
      (!preferredCategory || car.category === preferredCategory) &&
      (!needsSevenSeats || car.features.includes("7 Seats")) &&
      (!dailyBudgetMax || car.pricing.daily <= dailyBudgetMax)
  );

  const availableCars = cars.filter((car) => car.available);

  return (exactMatches.length ? exactMatches : relaxedMatches.length ? relaxedMatches : availableCars).slice(0, 3);
}

function normalizeCarName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findSelectedCar(messages: string[], options = cars) {
  const optionIndexMap: Record<string, number> = {
    "1": 0,
    one: 0,
    first: 0,
    "2": 1,
    two: 1,
    second: 1,
    "3": 2,
    three: 2,
    third: 2,
  };

  for (const message of [...messages].reverse()) {
    const normalizedMessage = normalizeCarName(message);
    const numberedChoice = normalizedMessage.match(
      /\b(?:option|car|number|no)?\s*(1|2|3|one|two|three|first|second|third)\b/i
    )?.[1];

    if (numberedChoice) {
      const selectedIndex = optionIndexMap[numberedChoice.toLowerCase()];

      if (selectedIndex !== undefined && options[selectedIndex]) {
        return options[selectedIndex];
      }
    }

    const selectedCar = cars.find((car) => {
      const model = normalizeCarName(car.model);
      const brand = normalizeCarName(car.brand);
      const aliases = [
        model,
        brand,
        model.replace("countryman", "").trim(),
        model.replace("benz", "mercedes benz").trim(),
      ].filter(Boolean);

      return aliases.some((alias) => normalizedMessage.includes(alias));
    });

    if (selectedCar) {
      return selectedCar;
    }
  }

  return undefined;
}

function getCarsMentionedInReply(reply: string) {
  const normalized = normalizeCarName(reply);

  return cars.filter((car) => normalized.includes(normalizeCarName(car.model)));
}

function getBookingState(messages: ChatMessage[], currentMessage: string, customer?: CustomerInfo): BookingState {
  const userMessages = getUserMessages(messages, currentMessage);
  const budget = findBudget(userMessages);
  const carType = findAliasMatch(carTypeAliases, userMessages) ?? findFirstMatch(carTypeOptions, userMessages);
  const dailyBudgetMax = getDailyBudgetMax(budget);
  const options = getFallbackOptions(carType, dailyBudgetMax);

  return {
    location: findAliasMatch(cityAliases, userMessages) ?? findFirstMatch(cityOptions, userMessages),
    pickupDate: findPickupDate(userMessages),
    duration: findDuration(userMessages),
    selectedCar: findSelectedCar(userMessages, options) ?? findSelectedCar(userMessages, cars),
    carType,
    budget,
    contactReady: Boolean(customer?.phone?.trim() && customer.email?.trim()) || Boolean(findWhatsApp(userMessages)),
    residencyStatus: findResidencyStatus(userMessages),
    insurancePreference: findInsurancePreference(userMessages),
    documentsUploaded: findDocumentUpload(userMessages),
    paymentIntent: findPaymentIntent(userMessages),
  };
}

function isBookingComplete(state: BookingState) {
  return Boolean(
    state.location &&
      state.pickupDate &&
      state.duration &&
      state.selectedCar &&
      state.contactReady &&
      state.residencyStatus &&
      state.insurancePreference &&
      state.documentsUploaded
  );
}

function getQuickOptions(state: BookingState) {
  if (!state.location) return cityOptions;
  if (!state.pickupDate || !state.duration) return pickupDurationOptions;
  if (!state.selectedCar && !state.carType) return carTypeOptions;
  if (!state.selectedCar) return getFallbackOptions(state.carType, getDailyBudgetMax(state.budget)).map((car) => car.model);
  if (!state.contactReady) return [];
  if (!state.residencyStatus) return residencyOptions;
  if (!state.insurancePreference) return insuranceOptions;
  if (!state.documentsUploaded) return [];
  if (!state.paymentIntent) return ["Proceed to secure payment"];

  return [];
}

function createChatResponse(reply: string, state: BookingState, forcePayment = false) {
  return Response.json({
    reply,
    cars: getCarsMentionedInReply(reply),
    payment: forcePayment || (isBookingComplete(state) && Boolean(state.paymentIntent)),
    options: getQuickOptions(state),
  });
}

function formatCarLine(car: Car, index?: number) {
  const prefix = index === undefined ? "" : `${index + 1}. `;
  const transmission = getCarTransmission(car.features) ?? "Rental ready";
  const seats = getCarSeats(car.features) ?? "Seats listed";
  const availability = car.available ? "needs confirmation" : "unavailable";

  return `${prefix}${car.model} | ${car.category} | AED ${car.pricing.daily}/day | ${transmission}, ${seats} | ${availability}`;
}

function getRequirementsFor(status: string) {
  if (/tourist|visitor|visit visa/i.test(status)) {
    return [
      "- Passport",
      "- Visa",
      "- Home country driving license",
      "- International Driving Permit if required for your nationality",
    ];
  }

  if (/gcc/i.test(status)) {
    return ["- GCC driving license", "- Passport or national ID if requested by the team"];
  }

  return ["- UAE driving license", "- Emirates ID", "- Passport copy if requested by the team"];
}

function getPaymentMethodReply() {
  return "Payment is through the secure checkout panel in this chat. You can use the card form or Apple Pay option shown there. Please do not send card details as chat text. Cash is only possible if the team confirms it for your booking, and deposits depend on the car and rental duration.";
}

function getFaqReply(text: string) {
  const normalized = text.toLowerCase();

  if (isPaymentMethodQuestion(text)) return getPaymentMethodReply();

  if (includesAny(normalized, ["document", "license", "licence", "emirates id", "passport", "visa", "idp", "minimum age", "age"])) {
    return [
      "Rental requirements are usually:",
      "- UAE residents: valid UAE driving license + Emirates ID.",
      "- GCC nationals: valid GCC driving license.",
      "- Tourists: passport + visa + home country license. Some nationalities also need an International Driving Permit.",
      "- Minimum age is typically 21-25 depending on car category.",
      "",
      "Are you a UAE resident, GCC national, or tourist?",
    ].join("\n");
  }

  if (includesAny(normalized, ["insurance", "cdw", "zero excess", "excess"])) {
    return "Insurance depends on the selected car. You can choose basic insurance, upgraded/full coverage, or ask the team to confirm the exact options. If you do not want upgraded insurance, say: no upgraded insurance or add-ons.";
  }

  if (includesAny(normalized, ["human", "agent", "person", "call me"])) {
    return "I can hand this to the team. They will use the contact details from the pre-chat form, or you can type a WhatsApp number here if you want to change it.";
  }

  if (includesAny(normalized, ["oman", "saudi", "ksa", "cross-border", "cross border", "border"])) {
    return "Cross-border driving needs current approval and permits. I cannot confirm it in chat, so the team must check it before booking.";
  }

  if (includesAny(normalized, ["salik", "toll", "parking fine", "fine"])) {
    return "Salik and parking or traffic fines are usually charged to the renter based on actual usage. The team can confirm current charges before payment.";
  }

  if (includesAny(normalized, ["fuel", "petrol", "gas"])) {
    return "Fuel is usually return-at-same-level or prepaid if offered. We should confirm the exact policy in your booking summary.";
  }

  if (includesAny(normalized, ["cancel", "cancellation", "refund policy"])) {
    return "Cancellation terms depend on the booking type and timing before pickup. The team can confirm the terms before payment.";
  }

  return undefined;
}

function getBookingReply(message: string, messages: ChatMessage[], customer?: CustomerInfo) {
  const state = getBookingState(messages, message, customer);
  const faqReply = getFaqReply(message);

  if (faqReply && !isBookingComplete(state)) {
    return { reply: faqReply, state };
  }

  if (!state.location) {
    return {
      reply: "Which emirate or pickup location do you need?",
      state,
    };
  }

  if (!state.pickupDate || !state.duration) {
    return {
      reply: `Got it, ${state.location}. What pickup day and rental duration do you need? For example: tomorrow for 5 days.`,
      state,
    };
  }

  if (!state.selectedCar && !state.carType) {
    return {
      reply: "What car would you like? You can name a model such as Mini Cooper, or choose a type like economy, sedan, SUV, luxury, or 7-seater.",
      state,
    };
  }

  if (!state.selectedCar) {
    const options = getFallbackOptions(state.carType, getDailyBudgetMax(state.budget));

    return {
      reply: [
        "Here are suitable options from our fleet:",
        ...options.map(formatCarLine),
        "",
        "Which car would you like to continue with?",
      ].join("\n"),
      state,
    };
  }

  if (!state.contactReady) {
    return {
      reply: [
        `Great, I will note ${state.selectedCar.model} as your preferred car.`,
        `Listed rate: AED ${state.selectedCar.pricing.daily}/day, AED ${state.selectedCar.pricing.weekly}/week, AED ${state.selectedCar.pricing.monthly}/month.`,
        "",
        "What WhatsApp number should our team use for follow-up?",
      ].join("\n"),
      state,
    };
  }

  if (!state.residencyStatus) {
    return {
      reply: [
        `Great, I have ${state.selectedCar.model} noted for ${state.location}.`,
        `Rate shown: AED ${state.selectedCar.pricing.daily}/day. Final availability still needs team confirmation.`,
        "",
        "Before documents, are you a UAE resident, GCC national, or tourist?",
      ].join("\n"),
      state,
    };
  }

  if (!state.insurancePreference) {
    return {
      reply: "Which insurance package do you want: basic insurance, upgraded/full coverage, or no upgraded insurance/add-ons? You can also ask the team to confirm the exact option for this car.",
      state,
    };
  }

  if (!state.documentsUploaded) {
    return {
      reply: [
        `Perfect. ${state.selectedCar.model} is noted with your insurance/add-ons preference.`,
        "Before payment, please upload the required documents as PDF:",
        ...getRequirementsFor(state.residencyStatus),
        "",
        "Use the Upload PDFs button below. After upload, I will show secure checkout.",
      ].join("\n"),
      state,
    };
  }

  if (!state.paymentIntent) {
    return {
      reply: [
        "Documents are received for verification.",
        "Booking summary:",
        `- Pickup location: ${state.location}`,
        `- Pickup date/duration: ${state.pickupDate}; ${state.duration}`,
        `- Car: ${state.selectedCar.model}`,
        `- Listed rate: AED ${state.selectedCar.pricing.daily}/day`,
        "- Final availability and exact deposit need team confirmation.",
        "",
        "When you are ready, press Proceed to secure payment.",
      ].join("\n"),
      state,
    };
  }

  return {
    reply: "Documents are received. Continue with the secure checkout panel below. Please do not type card details into the chat.",
    state,
    payment: true,
  };
}

async function getGeminiFaqReply(message: string, messages: ChatMessage[], customer?: CustomerInfo) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) return undefined;

  const ai = new GoogleGenAI({ apiKey });
  const customerContext = customer?.phone
    ? `Customer already provided contact details: ${customer.name || "name provided"}, ${customer.phone}, ${customer.email || "Gmail provided"}. Do not ask for them again.`
    : "No pre-chat customer contact details were provided.";
  const conversation = messages
    .map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.text}`)
    .join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
You are Quicko, the AI rental assistant for QUICK AND EASY car rental in the UAE.
Answer concise FAQs only. Do not override booking flow steps. Never ask for card details in chat.
Payment is through the embedded secure checkout panel with card or Apple Pay.
Use AED. Do not invent exact deposits, availability, fines, or policy numbers.

${customerContext}

Conversation:
${conversation}

User message:
${message}
    `,
  });

  return response.text?.trim();
}

export async function POST(req: Request) {
  try {
    const { message, messages = [], customer } = (await req.json()) as {
      message: string;
      messages?: ChatMessage[];
      customer?: CustomerInfo;
    };

    if (!message?.trim()) {
      return Response.json({ reply: "Please type a message so I can help with your rental." });
    }

    const deterministic = getBookingReply(message, messages, customer);
    const forceFallback =
      process.env.NODE_ENV !== "production" &&
      req.headers.get("x-quicko-simulation") === "fallback";

    if (forceFallback || deterministic.payment || isBookingComplete(deterministic.state)) {
      return createChatResponse(deterministic.reply, deterministic.state, deterministic.payment);
    }

    const faqReply = getFaqReply(message);

    if (faqReply) {
      return createChatResponse(faqReply, deterministic.state);
    }

    try {
      const geminiReply = await getGeminiFaqReply(message, messages, customer);

      if (geminiReply && !/which car|what duration|insurance package/i.test(geminiReply)) {
        return createChatResponse(geminiReply, deterministic.state);
      }
    } catch (error) {
      console.error("Gemini chat failed, using deterministic reply:", error);
    }

    return createChatResponse(deterministic.reply, deterministic.state, deterministic.payment);
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { reply: "Sorry, I could not read that message. Please try again." },
      { status: 500 }
    );
  }
}
