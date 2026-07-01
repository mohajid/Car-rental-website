import { cars } from "@/data/cars";
import { GoogleGenAI } from "@google/genai";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim().replace(/^['"]|['"]$/g, "");

  return apiKey?.startsWith("AIza") ? apiKey : undefined;
}

const cityOptions = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ras Al-Khaimah",
  "Al Ain",
  "Fujairah",
  "Ajman",
];

const carTypeOptions = ["Economy", "Sedan", "SUV", "Luxury", "7-seater", "Monthly rental"];

const cityAliases: Record<string, string[]> = {
  "Abu Dhabi": ["abu dhabi", "abudhabi", "أبوظبي", "ابوظبي"],
  Dubai: ["dubai", "دبي"],
  Sharjah: ["sharjah", "الشارقة", "شارقة"],
  "Ras Al-Khaimah": ["ras al-khaimah", "ras al khaimah", "rak", "رأس الخيمة", "راس الخيمة"],
  "Al Ain": ["al ain", "العين"],
  Fujairah: ["fujairah", "الفجيرة", "فجيرة"],
  Ajman: ["ajman", "عجمان"],
};

const carTypeAliases: Record<string, string[]> = {
  Economy: ["economy", "اقتصادية", "اقتصادي"],
  Sedan: ["sedan", "صالون", "سيدان"],
  SUV: ["suv", "دفع رباعي", "جيب"],
  Luxury: ["luxury", "فاخرة", "فاخر"],
  "7-seater": ["7-seater", "7 seater", "seven seater", "سبعة مقاعد", "7 مقاعد"],
  "Monthly rental": ["monthly rental", "monthly", "شهري", "شهرية"],
};

const arabicCityLabels: Record<string, string> = {
  "Abu Dhabi": "أبوظبي",
  Dubai: "دبي",
  Sharjah: "الشارقة",
  "Ras Al-Khaimah": "رأس الخيمة",
  "Al Ain": "العين",
  Fujairah: "الفجيرة",
  Ajman: "عجمان",
};

const arabicCategoryLabels: Record<string, string> = {
  Economy: "اقتصادية",
  Sedan: "سيدان",
  SUV: "SUV",
};

function isArabic(text: string) {
  return /[\u0600-\u06ff]/.test(text);
}

function includesAny(text: string, terms: string[]) {
  const normalized = text.toLowerCase();

  return terms.some((term) => normalized.includes(term));
}

function getUserMessages(messages: ChatMessage[], currentMessage: string) {
  const history = messages.filter((item) => item.role === "user").map((item) => item.text);

  if (history.at(-1)?.trim() !== currentMessage.trim()) {
    history.push(currentMessage);
  }

  return history;
}

function findFirstMatch(values: string[], messages: string[]) {
  return messages.reduce<string | undefined>((match, text) => {
    if (match) return match;

    const normalized = text.toLowerCase();
    return values.find((value) => normalized.includes(value.toLowerCase()));
  }, undefined);
}

function findAliasMatch(aliases: Record<string, string[]>, messages: string[]) {
  return messages.reduce<string | undefined>((match, text) => {
    if (match) return match;

    const normalized = text.toLowerCase();
    return Object.entries(aliases).find(([, terms]) =>
      terms.some((term) => normalized.includes(term.toLowerCase()))
    )?.[0];
  }, undefined);
}

function findDuration(messages: string[]) {
  return messages.find((text) =>
    /\b(today|tomorrow|week|weeks|month|months|year|years|\d{1,2}\s*days?|\d{1,2}[/-]\d{1,2})\b/i.test(text)
  );
}

function findBudget(messages: string[]) {
  return messages.find((text) => /\b(aed|budget|under|\d+\s*(?:-|to)\s*\d+|\d+\s*(?:\/day|daily|month|monthly))\b/i.test(text));
}

function findWhatsApp(messages: string[]) {
  return messages.find((text) => /(?:\+?\d[\s-]?){7,}/.test(text));
}

function findDocumentUpload(messages: string[]) {
  return messages.find((text) =>
    /\b(uploaded pdf documents|documents uploaded|pdf documents|driving license pdf|driving licence pdf|emirates id pdf|passport pdf|visa pdf)\b/i.test(
      text
    )
  );
}

function findPaymentIntent(messages: string[]) {
  return messages.find((text) =>
    /\b(pay|payment|checkout|secure checkout|proceed|card|deposit)\b/i.test(text)
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

function getFallbackOptions(location?: string, carType?: string, dailyBudgetMax?: number) {
  const preferredCategory =
    carType && !["Monthly rental", "Luxury", "7-seater"].includes(carType) ? carType : undefined;

  const exactMatches = cars.filter(
    (car) =>
      (!location || car.location.toLowerCase() === location.toLowerCase()) &&
      (!preferredCategory || car.category === preferredCategory) &&
      (!dailyBudgetMax || car.dailyPrice <= dailyBudgetMax)
  );

  const relaxedMatches = cars.filter(
    (car) =>
      (!preferredCategory || car.category === preferredCategory) &&
      (!dailyBudgetMax || car.dailyPrice <= dailyBudgetMax)
  );

  const options = exactMatches.length > 0 ? exactMatches : relaxedMatches.length > 0 ? relaxedMatches : cars;

  return options.slice(0, 3);
}

function formatLocation(location: string, arabic: boolean) {
  return arabic ? arabicCityLabels[location] ?? location : location;
}

function formatCategory(category: string, arabic: boolean) {
  return arabic ? arabicCategoryLabels[category] ?? category : category;
}

function getRequirementsReply(arabic: boolean) {
  if (arabic) {
    return [
      "متطلبات التأجير عادة تكون:",
      "- المقيمون في الإمارات: رخصة قيادة إماراتية سارية + الهوية الإماراتية.",
      "- مواطنو دول الخليج: رخصة قيادة خليجية سارية.",
      "- السياح: جواز سفر + تأشيرة + رخصة بلدك. بعض الجنسيات تحتاج رخصة قيادة دولية، لذلك الأفضل تأكيد القائمة مع فريقنا.",
      "- الحد الأدنى للعمر عادة 21 إلى 25 حسب فئة السيارة.",
      "",
      "هل أنت مقيم في الإمارات أم سائح؟",
    ].join("\n");
  }

  return [
    "Rental requirements are usually:",
    "- UAE residents: valid UAE driving license + Emirates ID.",
    "- GCC nationals: valid GCC driving license.",
    "- Tourists: passport + visa + home country license. Some nationalities also need an International Driving Permit, so our team should confirm the exact list.",
    "- Minimum age is typically 21-25 depending on vehicle category.",
    "",
    "Are you a UAE resident, GCC national, or tourist?",
  ].join("\n");
}

function getFaqReply(text: string, arabic: boolean) {
  if (includesAny(text, ["human", "agent", "person", "call me", "اتصل", "موظف", "انسان"])) {
    return arabic
      ? "سأحوّل طلبك إلى أحد أعضاء الفريق. سيستلمون تفاصيل المحادثة ويردون عليك في أقرب وقت. ما رقم واتساب المناسب؟"
      : "I'll connect you with our team. They will see the chat details and reply as soon as possible. What WhatsApp number should they use?";
  }

  if (includesAny(text, ["accident", "complaint", "refund", "dispute", "damage", "حادث", "شكوى", "استرداد", "نزاع"])) {
    return arabic
      ? "هذا يحتاج متابعة من الفريق مباشرة. سأحوّلك لهم حتى يتم التعامل مع الحالة بشكل صحيح. ما رقم واتساب المناسب؟"
      : "This needs a human agent. I'll hand this to our team so they can handle it properly. What WhatsApp number should they use?";
  }

  if (includesAny(text, ["oman", "saudi", "ksa", "cross-border", "cross border", "border", "عمان", "السعودية", "خارج"])) {
    return arabic
      ? "السفر خارج الإمارات يحتاج موافقة وتصاريح حسب السياسة الحالية. لا أستطيع تأكيده من الدردشة. سأحوّلك للفريق للتأكد. ما وجهتك والتواريخ؟"
      : "Cross-border driving needs current approval and permits. I cannot confirm it in chat. I'll connect you with our team to check. Which country and dates do you need?";
  }

  if (includesAny(text, ["requirement", "license", "licence", "emirates id", "passport", "visa", "idp", "documents", "eligible", "age", "رخصة", "هوية", "جواز", "تأشيرة", "العمر", "المستندات"])) {
    return getRequirementsReply(arabic);
  }

  if (includesAny(text, ["insurance", "cdw", "zero excess", "excess", "تأمين"])) {
    return arabic
      ? "التأمين عادة يكون إما أساسي CDW أو تغطية أعلى/زيرو إكسس حسب السيارة. التفاصيل والمبلغ تختلف حسب الفئة. هل تريدني أطلب من الفريق تأكيد خيارات التأمين لهذه السيارة؟"
      : "Insurance is usually basic CDW or an upgraded/full zero-excess option, depending on the car. The exact terms vary by vehicle. Should I ask the team to confirm insurance options for your car?";
  }

  if (includesAny(text, ["salik", "toll", "parking fine", "fine", "سالك", "مخالفة", "مواقف"])) {
    return arabic
      ? "سالك والمخالفات عادة تُحمّل على المستأجر حسب الاستخدام الفعلي. لا أريد تخمين الرسوم الدقيقة. هل تريد تأكيدها مع الفريق قبل الحجز؟"
      : "Salik and parking/traffic fines are usually charged to the renter based on actual usage. I will not guess exact fees. Would you like the team to confirm the current charges before booking?";
  }

  if (includesAny(text, ["fuel", "petrol", "gas", "وقود", "بنزين"])) {
    return arabic
      ? "سياسة الوقود غالبا تكون إرجاع السيارة بنفس مستوى الوقود أو حسب خيار الدفع المسبق إن توفر. سنؤكد السياسة مع ملخص الحجز. ما تاريخ الاستلام؟"
      : "Fuel is usually return-at-same-level or prepaid if offered. We should confirm the exact policy in your booking summary. What pickup date do you need?";
  }

  if (includesAny(text, ["cancel", "cancellation", "refund policy", "إلغاء"])) {
    return arabic
      ? "سياسة الإلغاء تعتمد على نوع الحجز والوقت المتبقي قبل الاستلام. أستطيع تجهيز الطلب، والفريق يؤكد الشروط قبل الدفع. ما تاريخ الاستلام؟"
      : "Cancellation terms depend on the booking type and timing before pickup. I can prepare the request, and the team can confirm the terms before payment. What pickup date do you need?";
  }

  if (includesAny(text, ["airport", "dxb", "auh", "shj", "delivery", "pickup", "drop-off", "مطار", "توصيل", "استلام", "تسليم"])) {
    return arabic
      ? "نستطيع ترتيب الاستلام أو التوصيل حسب الإمارة والتوفر، بما في ذلك مطارات DXB وAUH وSHJ عند التأكيد. ما موقع الاستلام والتاريخ؟"
      : "Pickup or delivery can usually be arranged depending on emirate and availability, including DXB, AUH, and SHJ airports when confirmed. What pickup location and date do you need?";
  }

  return undefined;
}

function getFallbackReply(message: string, messages: ChatMessage[]) {
  const userMessages = getUserMessages(messages, message);
  const allUserText = userMessages.join(" ");
  const arabic = isArabic(allUserText);
  const faqReply = getFaqReply(allUserText, arabic);

  if (faqReply) {
    return faqReply;
  }

  const location = findAliasMatch(cityAliases, userMessages) ?? findFirstMatch(cityOptions, userMessages);
  const duration = findDuration(userMessages);
  const budget = findBudget(userMessages);
  const carType = findAliasMatch(carTypeAliases, userMessages) ?? findFirstMatch(carTypeOptions, userMessages);
  const whatsapp = findWhatsApp(userMessages);
  const documents = findDocumentUpload(userMessages);
  const paymentIntent = findPaymentIntent(userMessages);

  if (!location) {
    return arabic
      ? "أهلا، أنا Quicko من QUICK AND EASY. في أي إمارة تريد استلام السيارة؟"
      : "Hi, I'm Quicko from QUICK AND EASY. Which emirate or pickup location do you need?";
  }

  if (!duration) {
    return arabic
      ? `تمام، ${formatLocation(location, arabic)}. ما تاريخ الاستلام ومدة الإيجار؟`
      : `Got it, ${location}. What pickup date and rental duration do you need?`;
  }

  if (!carType) {
    return arabic
      ? "ما نوع السيارة المناسب لك: اقتصادية، سيدان، SUV، فاخرة، أو 7 مقاعد؟"
      : "What vehicle type do you prefer: economy, sedan, SUV, luxury, or 7-seater?";
  }

  if (!budget) {
    return arabic
      ? "ما الميزانية التقريبية بالدرهم؟ يومية، أسبوعية، أو شهرية؟"
      : "What budget should I work with in AED: daily, weekly, or monthly?";
  }

  const dailyBudgetMax = getDailyBudgetMax(budget);
  const options = getFallbackOptions(location, carType, dailyBudgetMax);

  if (!whatsapp) {
    const optionLines = options
      .map((car) => {
        const category = formatCategory(car.category, arabic);
        const price = arabic ? `AED ${car.dailyPrice}/يوم` : `AED ${car.dailyPrice}/day`;
        const features = arabic
          ? `${car.transmission}, ${car.fuel}, ${car.seats} مقاعد`
          : `${car.transmission}, ${car.fuel}, ${car.seats} seats`;
        const availability = arabic ? "التوفر: يحتاج تأكيد" : "Availability: needs confirmation";

        return `- ${car.name} | ${category} | ${price} | ${features} | ${availability}`;
      })
      .join("\n");

    if (arabic) {
      return [
        "هذه خيارات مناسبة من القائمة المتوفرة لدينا:",
        optionLines,
        "",
        "الأسعار تقديرية حسب القائمة، والتوفر النهائي يحتاج تأكيد. أي خيار تفضّل، وما رقم واتساب للمتابعة؟",
      ].join("\n");
    }

    return [
      "Here are suitable options from our list:",
      optionLines,
      "",
      "Rates are from the current list, and final availability needs confirmation. Which option do you prefer, and what WhatsApp number should our team use?",
    ].join("\n");
  }

  if (!documents) {
    return arabic
      ? [
          "تمام. قبل الدفع، نحتاج المستندات بصيغة PDF للتحقق:",
          "- رخصة القيادة",
          "- الهوية الإماراتية للمقيمين، أو جواز السفر + التأشيرة للسياح",
          "- رخصة قيادة دولية إذا كانت مطلوبة حسب الجنسية",
          "",
          "يرجى رفع الملفات بصيغة PDF فقط. بعد التحقق ننتقل إلى رابط الدفع الآمن.",
        ].join("\n")
      : [
          "Great. Before payment, please upload the required documents as PDF:",
          "- Driving license",
          "- Emirates ID for UAE residents, or passport + visa for tourists",
          "- International Driving Permit if required for your nationality",
          "",
          "Please upload PDF files only. After verification, we can move to secure checkout.",
        ].join("\n");
  }

  if (paymentIntent) {
    return arabic
      ? "تم استلام المستندات للتحقق. الخطوة التالية هي الدفع عبر رابط دفع آمن فقط. لا ترسل بيانات البطاقة في الدردشة. هل تريد إرسال الطلب للفريق لإصدار رابط الدفع؟"
      : "Documents are received for verification. The next step is payment through a secure checkout link only. Do not share card details in chat. Shall I send this request to the team to issue the payment link?";
  }

  return arabic
    ? "تم استلام المستندات للتحقق. الحجز لا يكون نهائيا إلا بعد الموافقة والدفع عبر الرابط الآمن. هل تريد المتابعة إلى الدفع الآمن؟"
    : "Documents are received for verification. The booking is not final until approval and secure payment are completed. Would you like to proceed to secure checkout?";
}

export async function POST(req: Request) {
  try {
    const { message, messages = [] } = (await req.json()) as {
      message: string;
      messages?: ChatMessage[];
    };

    if (!message?.trim()) {
      return Response.json({ reply: "Please type a message so I can help with your rental." });
    }

    const geminiApiKey = getGeminiApiKey();

    if (!geminiApiKey) {
      return Response.json({
        reply: getFallbackReply(message, messages),
      });
    }

    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
    });

    const carData = JSON.stringify(cars);
    const conversation = messages
      .map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.text}`)
      .join("\n");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are Quicko, the AI rental assistant for QUICK AND EASY, a UAE car rental service.

Language and tone:
- Detect the user's language and reply in the same language. Default to English. If the user writes Arabic, reply in natural Modern Standard / Gulf-friendly Arabic.
- Be warm, professional, concise, and helpful.
- Use short sentences and scannable bullets.
- Use AED for all pricing. Never use USD.
- Do not assume the user knows UAE rental rules.

Core capabilities:
- Help users find cars based on trip dates, pickup/drop-off location, budget, vehicle type, and special needs such as child seat, unlimited mileage, or delivery.
- Explain pricing clearly: daily, weekly, or monthly rate, security deposit, insurance tiers, Salik/tolls, late return fees, and fuel policy.
- Explain eligibility:
  - UAE residents: valid UAE driving license + Emirates ID.
  - GCC nationals: GCC driving license accepted directly.
  - Tourists: passport + visa + home country license. Some nationalities need an International Driving Permit; flag this and suggest confirming the exact list with a human agent.
  - Minimum age is typically 21-25 depending on car category. Say "typically" and defer exact cutoffs to the live rate card or human agent.
- Walk the user through booking and confirm details before finalizing: dates, location, car class, add-ons, and estimated cost.
- Answer FAQs about cancellation, cross-border travel, airport delivery/pickup, roadside assistance, Salik, parking fines, and fuel policy.
- Before payment, ask the user to upload required documents in PDF format: driving license, Emirates ID for UAE residents, or passport + visa for tourists. Mention IDP only when relevant and ask a human to confirm exact nationality rules.

Rules:
- Do not invent specific prices, availability, deposits, age cutoffs, fine amounts, or exact policy numbers that are not in the car list or official policy context.
- Recommend cars only from the car list below.
- When presenting a car, use exactly this format:
  Name | Category | Price/day | Key features | Availability
- Availability must be "needs confirmation" unless live availability is explicitly provided.
- Do not confirm a booking as final. Say: "Here is your booking summary. Shall I proceed?" or equivalent.
- Do not take payment card details in chat. Direct users to the secure checkout flow.
- Do not proceed to payment until the user has uploaded or confirmed the required PDF documents.
- If the user tries to type card details or asks to pay in chat, stop them and direct them to secure checkout.
- Do not give legal or insurance advice beyond policy-level explanations.
- Do not promise cross-border driving to Oman, KSA, or elsewhere. Escalate it to a human agent.
- Hand off to a human for complaints, accidents, disputes, refunds, cross-border authorization, corporate/long-term leasing, below-minimum-age exceptions, explicit human requests, or anything uncertain.
- When escalating, say plainly what happens next, without inventing a response time.

Conversation flow:
1. If trip details are missing, ask for pickup date/duration, pickup/drop-off location, and vehicle preference.
2. Present 2-3 relevant car options with clear AED pricing from the car list.
3. Ask about insurance tier and add-ons.
4. Confirm eligibility documents based on residency/nationality status.
5. Ask for required documents as PDF uploads.
6. Summarize estimated cost and next steps before secure checkout/human handoff.

Keep most replies under 90 words. End most turns with a clear next-step question.

Car list:
${carData}

Conversation so far:
${conversation}

User message:
${message}
      `,
      });

      return Response.json({
        reply: response.text || getFallbackReply(message, messages),
      });
    } catch (error) {
      console.error("Gemini chat failed, using fallback:", error);

      return Response.json({
        reply: getFallbackReply(message, messages),
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { reply: "Sorry, I could not read that message. Please try again." },
      { status: 500 }
    );
  }
}
