import { cars } from "@/data/cars";
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

const cityAliases: Record<string, string[]> = {
  "Abu Dhabi": ["abu dhabi", "abudhabi", "auh", "أبوظبي", "ابوظبي"],
  Dubai: ["dubai", "dxb", "دبي"],
  Sharjah: ["sharjah", "shj", "الشارقة", "شارقة"],
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
  Electric: ["electric", "ev", "tesla"],
  Sports: ["sports", "sport", "mustang", "porsche"],
  Hatchback: ["hatchback", "compact"],
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
  Luxury: "Luxury",
  Electric: "Electric",
  Sports: "Sports",
  Hatchback: "Hatchback",
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

function findResidencyStatus(messages: string[]) {
  return messages.find((text) =>
    /\b(uae resident|resident|gcc national|gcc|tourist|visitor|visit visa)\b/i.test(text)
  );
}

function findInsuranceAndAddOnsPreference(messages: string[]) {
  return messages.find((text) =>
    /\b(basic|standard|full coverage|full insurance|upgraded coverage|zero excess|insurance upgrade|cdw|child seat|baby seat|gps|additional driver|home delivery|car delivery|deliver to|delivery service|drop-off service|drop off service|no add-ons|no addons|no extras|none needed|no thanks|ask the team|confirm insurance|confirm it)\b/i.test(
      text
    )
  );
}

function isAffirmativeInsuranceAnswer(text: string) {
  return /\b(yes|yeah|yep|sure|ok|okay|please|confirm|ask them|ask team|do that|go ahead)\b/i.test(
    text
  );
}

function isInsurancePrompt(text: string) {
  return /\b(insurance|cdw|zero excess|add-ons|addons|extras|child seat|gps|additional driver|delivery)\b/i.test(
    text
  );
}

function hasInsuranceAndAddOnsPreference(
  userMessages: string[],
  currentMessage: string,
  messages?: ChatMessage[]
) {
  if (findInsuranceAndAddOnsPreference(userMessages)) {
    return true;
  }

  const lastAssistantMessage = [...(messages ?? [])]
    .reverse()
    .find((item) => item.role === "assistant")?.text;
  const conversation = [...(messages ?? [])];

  if (conversation.at(-1)?.text.trim() !== currentMessage.trim()) {
    conversation.push({ role: "user", text: currentMessage });
  }

  const answeredPreviousInsurancePrompt = conversation.some((item, index) => {
    const nextItem = conversation[index + 1];

    return (
      item.role === "assistant" &&
      isInsurancePrompt(item.text) &&
      nextItem?.role === "user" &&
      isAffirmativeInsuranceAnswer(nextItem.text)
    );
  });

  return Boolean(
    answeredPreviousInsurancePrompt ||
    lastAssistantMessage &&
      isInsurancePrompt(lastAssistantMessage) &&
      isAffirmativeInsuranceAnswer(currentMessage)
  );
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

function getCarTransmission(features: string[]) {
  return features.find((feature) => ["Automatic", "Manual"].includes(feature));
}

function getCarSeats(features: string[]) {
  return features.find((feature) => feature.includes("Seats"));
}

function getCarsMentionedInReply(reply: string) {
  const normalized = reply.toLowerCase();

  return cars.filter((car) => normalized.includes(car.model.toLowerCase()));
}

function getPaymentReadiness(messages: ChatMessage[], currentMessage: string, customer?: CustomerInfo) {
  const userMessages = getUserMessages(messages, currentMessage);
  const location = findAliasMatch(cityAliases, userMessages) ?? findFirstMatch(cityOptions, userMessages);
  const duration = findDuration(userMessages);
  const budget = findBudget(userMessages);
  const carType = findAliasMatch(carTypeAliases, userMessages) ?? findFirstMatch(carTypeOptions, userMessages);
  const whatsapp = customer?.phone?.trim() || findWhatsApp(userMessages);
  const residencyStatus = findResidencyStatus(userMessages);
  const insuranceAndAddOns = hasInsuranceAndAddOnsPreference(userMessages, currentMessage, messages);
  const documents = findDocumentUpload(userMessages);
  const paymentIntent = findPaymentIntent(userMessages);
  const dailyBudgetMax = getDailyBudgetMax(budget);
  const options =
    location && carType && budget ? getFallbackOptions(location, carType, dailyBudgetMax) : cars;
  const selectedCar = findSelectedCar(userMessages, options);

  return Boolean(
    location &&
      duration &&
      budget &&
      carType &&
      selectedCar &&
      whatsapp &&
      residencyStatus &&
      insuranceAndAddOns &&
      documents &&
      paymentIntent
  );
}

function createChatResponse(reply: string, payment = false) {
  return Response.json({
    reply,
    cars: getCarsMentionedInReply(reply),
    payment,
  });
}

function getNonLoopingReply(
  reply: string,
  message: string,
  messages: ChatMessage[],
  customer?: CustomerInfo
) {
  const userMessages = getUserMessages(messages, message);
  const answeredInsuranceQuestion = hasInsuranceAndAddOnsPreference(
    userMessages,
    message,
    messages
  );
  const repeatsInsurancePrompt =
    /insurance is usually basic cdw|should i ask .*confirm insurance|would you like basic insurance|upgraded\/full zero-excess/i.test(
      reply
    );

  if (answeredInsuranceQuestion && repeatsInsurancePrompt) {
    return getFallbackReply(message, messages, customer);
  }

  return reply;
}

function getFallbackOptions(location?: string, carType?: string, dailyBudgetMax?: number) {
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
  const options =
    exactMatches.length > 0
      ? exactMatches
      : relaxedMatches.length > 0
        ? relaxedMatches
        : availableCars;

  return options.slice(0, 3);
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
    const normalizedMessage = message.toLowerCase();
    const numberedChoice = normalizedMessage.match(
      /\b(?:option|car|number|no\.?)?\s*(1|2|3|one|two|three|first|second|third)\b/i
    )?.[1];

    if (numberedChoice) {
      const selectedIndex = optionIndexMap[numberedChoice.toLowerCase()];

      if (selectedIndex !== undefined && options[selectedIndex]) {
        return options[selectedIndex];
      }
    }

    const selectedCar = options.find((car) => {
      const model = car.model.toLowerCase();
      const brand = car.brand.toLowerCase();

      return normalizedMessage.includes(model) || normalizedMessage.includes(brand);
    });

    if (selectedCar) {
      return selectedCar;
    }
  }

  return undefined;
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

  if (
    includesAny(text, ["requirement", "license", "licence", "emirates id", "passport", "visa", "idp", "documents", "eligible", "رخصة", "هوية", "جواز", "تأشيرة", "العمر", "المستندات"]) ||
    /\b(?:age|minimum age)\b/i.test(text)
  ) {
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

  return undefined;
}

function getPickupDeliveryReply(text: string, arabic: boolean) {
  if (!includesAny(text, ["airport", "dxb", "auh", "shj", "delivery", "pickup", "drop-off", "مطار", "توصيل", "استلام", "تسليم"])) {
    return undefined;
  }

  return arabic
    ? "نستطيع ترتيب الاستلام أو التوصيل حسب الإمارة والتوفر، بما في ذلك مطارات DXB وAUH وSHJ عند التأكيد. ما موقع الاستلام والتاريخ؟"
    : "Pickup or delivery can usually be arranged depending on emirate and availability, including DXB, AUH, and SHJ airports when confirmed. What pickup location and date do you need?";
}

function getFallbackReply(message: string, messages: ChatMessage[], customer?: CustomerInfo) {
  const userMessages = getUserMessages(messages, message);
  const allUserText = userMessages.join(" ");
  const arabic = isArabic(allUserText);
  const location = findAliasMatch(cityAliases, userMessages) ?? findFirstMatch(cityOptions, userMessages);
  const duration = findDuration(userMessages);
  const budget = findBudget(userMessages);
  const carType = findAliasMatch(carTypeAliases, userMessages) ?? findFirstMatch(carTypeOptions, userMessages);
  const whatsapp = customer?.phone?.trim() || findWhatsApp(userMessages);
  const residencyStatus = findResidencyStatus(userMessages);
  const insuranceAndAddOns = hasInsuranceAndAddOnsPreference(userMessages, message, messages);
  const documents = findDocumentUpload(userMessages);
  const paymentIntent = findPaymentIntent(userMessages);
  const faqReply = insuranceAndAddOns ? undefined : getFaqReply(message, arabic);

  if (faqReply) {
    return faqReply;
  }

  if (!location) {
    const pickupDeliveryReply = getPickupDeliveryReply(allUserText, arabic);

    if (pickupDeliveryReply) {
      return pickupDeliveryReply;
    }

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
  const selectedCar = findSelectedCar(userMessages, options);

  if (!whatsapp) {
    if (selectedCar) {
      return arabic
        ? [
            `تمام، سأضع ${selectedCar.model} كخيارك المفضل.`,
            `السعر حسب القائمة: AED ${selectedCar.pricing.daily}/يوم، AED ${selectedCar.pricing.weekly}/أسبوع، AED ${selectedCar.pricing.monthly}/شهر.`,
            "",
            "ما رقم واتساب المناسب ليؤكد الفريق التوفر النهائي ويتابع الحجز؟",
          ].join("\n")
        : [
            `Great, I will note ${selectedCar.model} as your preferred car.`,
            `Listed rate: AED ${selectedCar.pricing.daily}/day, AED ${selectedCar.pricing.weekly}/week, AED ${selectedCar.pricing.monthly}/month.`,
            "",
            "What WhatsApp number should our team use to confirm final availability and continue the booking?",
          ].join("\n");
    }

    const optionLines = options
      .map((car) => {
        const category = formatCategory(car.category, arabic);
        const price = arabic ? `AED ${car.pricing.daily}/يوم` : `AED ${car.pricing.daily}/day`;
        const transmission = getCarTransmission(car.features) ?? "Rental ready";
        const seats = getCarSeats(car.features) ?? "Seats listed";
        const features = arabic
          ? `${transmission}, ${seats}`
          : `${transmission}, ${seats}`;
        const availability = car.available
          ? arabic
            ? "التوفر: يحتاج تأكيد"
            : "Availability: needs confirmation"
          : arabic
            ? "التوفر: غير متاح حاليا"
            : "Availability: unavailable";

        return `- ${car.model} | ${category} | ${price} | ${features} | ${availability}`;
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

  if (!selectedCar) {
    const optionLines = options
      .map((car, index) => {
        const category = formatCategory(car.category, arabic);
        const price = arabic ? `AED ${car.pricing.daily}/ÙŠÙˆÙ…` : `AED ${car.pricing.daily}/day`;
        const transmission = getCarTransmission(car.features) ?? "Rental ready";
        const seats = getCarSeats(car.features) ?? "Seats listed";
        const availability = car.available
          ? arabic
            ? "Ø§Ù„ØªÙˆÙØ±: ÙŠØ­ØªØ§Ø¬ ØªØ£ÙƒÙŠØ¯"
            : "Availability: needs confirmation"
          : arabic
            ? "Ø§Ù„ØªÙˆÙØ±: ØºÙŠØ± Ù…ØªØ§Ø­ Ø­Ø§Ù„ÙŠØ§"
            : "Availability: unavailable";

        return `${index + 1}. ${car.model} | ${category} | ${price} | ${transmission}, ${seats} | ${availability}`;
      })
      .join("\n");

    return arabic
      ? [
          "Ù‚Ø¨Ù„ Ø±ÙØ¹ Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø£Ùˆ Ø§Ù„Ø¯ÙØ¹ØŒ ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø³ÙŠØ§Ø±Ø© Ø§Ù„Ù…ÙØ¶Ù„Ø©:",
          optionLines,
          "",
          "Ø£ÙŠ Ø®ÙŠØ§Ø± ØªØ±ÙŠØ¯ØŸ",
        ].join("\n")
      : [
          "Before documents or payment, please choose the car you prefer:",
          optionLines,
          "",
          "Which option would you like to continue with?",
        ].join("\n");
  }

  if (!residencyStatus) {
    return arabic
      ? "Ù‚Ø¨Ù„ Ø±ÙØ¹ Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§ØªØŒ Ù‡Ù„ Ø£Ù†Øª Ù…Ù‚ÙŠÙ… ÙÙŠ Ø§Ù„Ø¥Ù…Ø§Ø±Ø§ØªØŒ Ù…ÙˆØ§Ø·Ù† Ø®Ù„ÙŠØ¬ÙŠØŒ Ø£Ù… Ø³Ø§Ø¦Ø­ØŸ"
      : "Before documents, are you a UAE resident, GCC national, or tourist? This tells us which PDF files are required.";
  }

  if (!insuranceAndAddOns) {
    return arabic
      ? "Ù‡Ù„ ØªØ±ÙŠØ¯ Ø§Ù„ØªØ£Ù…ÙŠÙ† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ø£Ùˆ ØªØºØ·ÙŠØ© Ø£Ø¹Ù„Ù‰ØŸ ÙˆÙ‡Ù„ ØªØ­ØªØ§Ø¬ Ø£ÙŠ Ø¥Ø¶Ø§ÙØ§Øª Ù…Ø«Ù„ Ù…Ù‚Ø¹Ø¯ Ø·ÙÙ„ØŒ Ø³Ø§Ø¦Ù‚ Ø¥Ø¶Ø§ÙÙŠØŒ GPSØŒ Ø£Ùˆ ØªÙˆØµÙŠÙ„ØŸ"
      : "Would you like basic insurance or an upgraded/full coverage option? Do you need any add-ons such as a child seat, GPS, additional driver, or delivery?";
  }

  if (!documents) {
    return arabic
      ? [
          selectedCar
            ? `تمام، تم اختيار ${selectedCar.model}. قبل الدفع، نحتاج المستندات بصيغة PDF للتحقق:`
            : "تمام. قبل الدفع، نحتاج المستندات بصيغة PDF للتحقق:",
          "- رخصة القيادة",
          "- الهوية الإماراتية للمقيمين، أو جواز السفر + التأشيرة للسياح",
          "- رخصة قيادة دولية إذا كانت مطلوبة حسب الجنسية",
          "",
          "يرجى رفع الملفات بصيغة PDF فقط. بعد التحقق ننتقل إلى رابط الدفع الآمن.",
        ].join("\n")
      : [
          selectedCar
            ? `Great, ${selectedCar.model} is noted. Before payment, please upload the required documents as PDF:`
            : "Great. Before payment, please upload the required documents as PDF:",
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
      : "Documents are received for verification. The next step is payment through the secure checkout panel in this chat. Do not type card details as a chat message. Please use the payment panel when it appears.";
  }

  return arabic
    ? "تم استلام المستندات للتحقق. الحجز لا يكون نهائيا إلا بعد الموافقة والدفع عبر الرابط الآمن. هل تريد المتابعة إلى الدفع الآمن؟"
    : "Documents are received for verification. The booking is not final until approval and secure payment are completed. Please use the secure checkout panel in this chat when you are ready.";
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

    const geminiApiKey = getGeminiApiKey();

    if (!geminiApiKey) {
      const reply = getFallbackReply(message, messages, customer);
      return createChatResponse(reply, getPaymentReadiness(messages, message, customer));
    }

    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
    });

    const carData = JSON.stringify(cars);
    const customerContext = customer?.phone
      ? [
          `Name: ${customer.name || "Provided before chat"}`,
          `Phone/WhatsApp: ${customer.phone}`,
          `Gmail: ${customer.email || "Provided before chat"}`,
          "These contact details were collected before chat. Do not ask for the user's name, phone number, WhatsApp number, or Gmail again unless they ask to change it.",
        ].join("\n")
      : "No pre-chat customer contact details were provided.";
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
- Do not accept payment card details as plain chat messages. Direct users to the embedded secure checkout panel.
- Do not proceed to payment until pickup/duration, location, vehicle preference, selected car, contact details, residency/tourist status, insurance/add-ons preference, and required PDF documents are all collected.
- Once the user answers the insurance/add-ons question, even with "yes", "basic", "full coverage", "no add-ons", or "ask the team to confirm", do not repeat the same insurance question. Move to the next missing booking step.
- If the user tries to type card details as chat text, stop them and direct them to the secure checkout panel.
- Do not give legal or insurance advice beyond policy-level explanations.
- Do not promise cross-border driving to Oman, KSA, or elsewhere. Escalate it to a human agent.
- Hand off to a human for complaints, accidents, disputes, refunds, cross-border authorization, corporate/long-term leasing, below-minimum-age exceptions, explicit human requests, or anything uncertain.
- When escalating, say plainly what happens next, without inventing a response time.
- If customer contact details are provided below, do not ask for name, WhatsApp/phone, or Gmail again.

Conversation flow:
1. If trip details are missing, ask for pickup date/duration, pickup/drop-off location, and vehicle preference.
2. Present 2-3 relevant car options with clear AED pricing from the car list.
3. If the user selects a car by name, brand, or option number, acknowledge that exact car and move forward. Do not show the same option list again.
4. Ask for the user's WhatsApp number only if it is missing from both the customer context and the chat.
5. Ask about insurance tier and add-ons.
6. Confirm eligibility documents based on residency/nationality status.
7. Ask for required documents as PDF uploads.
8. Summarize estimated cost and next steps before secure checkout/human handoff.

Keep most replies under 90 words. End most turns with a clear next-step question.

Car list:
${carData}

Customer context:
${customerContext}

Conversation so far:
${conversation}

User message:
${message}
      `,
      });

      const reply = getNonLoopingReply(
        response.text || getFallbackReply(message, messages, customer),
        message,
        messages,
        customer
      );
      return createChatResponse(reply, getPaymentReadiness(messages, message, customer));
    } catch (error) {
      console.error("Gemini chat failed, using fallback:", error);

      const reply = getFallbackReply(message, messages, customer);
      return createChatResponse(reply, getPaymentReadiness(messages, message, customer));
    }
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { reply: "Sorry, I could not read that message. Please try again." },
      { status: 500 }
    );
  }
}
