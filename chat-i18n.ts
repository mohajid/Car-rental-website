// Central place for every bit of chatbot text and every keyword list used to
// understand user input, in English and Arabic. Keeping it in one file means
// when you want to add a third language later, you only edit here.

export type Lang = "en" | "ar";

export function normalizeLang(value: unknown): Lang {
  return value === "ar" ? "ar" : "en";
}

// Detects language from the message text itself: if it contains Arabic
// script characters, respond in Arabic; otherwise respond in English.
// This is what makes the chatbot auto-switch per message, with no toggle.
const ARABIC_SCRIPT_PATTERN = /[\u0600-\u06FF\u0750-\u077F]/;

export function detectLanguage(text: string): Lang {
  return ARABIC_SCRIPT_PATTERN.test(text) ? "ar" : "en";
}

// ---------------------------------------------------------------------------
// Display labels for canonical values.
// The *canonical* value (the English key on the left) is what the rest of the
// backend uses internally for matching against data/cars.ts categories, etc.
// The label is only what gets shown to the user / sent back as button text.
// ---------------------------------------------------------------------------

export const LOCATION_LABELS: Record<string, Record<Lang, string>> = {
  "Abu Dhabi": { en: "Abu Dhabi", ar: "أبوظبي" },
  Dubai: { en: "Dubai", ar: "دبي" },
  Sharjah: { en: "Sharjah", ar: "الشارقة" },
  "Ras Al-Khaimah": { en: "Ras Al-Khaimah", ar: "رأس الخيمة" },
  "Al Ain": { en: "Al Ain", ar: "العين" },
  Fujairah: { en: "Fujairah", ar: "الفجيرة" },
  Ajman: { en: "Ajman", ar: "عجمان" },
};

export const CAR_TYPE_LABELS: Record<string, Record<Lang, string>> = {
  Economy: { en: "Economy", ar: "اقتصادية" },
  Sedan: { en: "Sedan", ar: "سيدان" },
  SUV: { en: "SUV", ar: "دفع رباعي" },
  Luxury: { en: "Luxury", ar: "فاخرة" },
  Electric: { en: "Electric", ar: "كهربائية" },
  Sports: { en: "Sports", ar: "رياضية" },
  Hatchback: { en: "Hatchback", ar: "هاتشباك" },
  "7-seater": { en: "7-seater", ar: "7 مقاعد" },
  "Monthly rental": { en: "Monthly rental", ar: "إيجار شهري" },
};

export const PICKUP_DURATION_LABELS: Record<string, Record<Lang, string>> = {
  "Tomorrow for 1 day": { en: "Tomorrow for 1 day", ar: "غدًا ليوم واحد" },
  "Tomorrow for 3 days": { en: "Tomorrow for 3 days", ar: "غدًا لمدة 3 أيام" },
  "Tomorrow for 5 days": { en: "Tomorrow for 5 days", ar: "غدًا لمدة 5 أيام" },
  "Next week for 1 week": { en: "Next week for 1 week", ar: "الأسبوع القادم لمدة أسبوع" },
};

export const INSURANCE_LABELS: Record<string, Record<Lang, string>> = {
  "Basic insurance, no add-ons": { en: "Basic insurance, no add-ons", ar: "تأمين أساسي، بدون إضافات" },
  "Full coverage / zero excess": { en: "Full coverage / zero excess", ar: "تغطية كاملة / بدون تحمل" },
  "No upgraded insurance or add-ons": { en: "No upgraded insurance or add-ons", ar: "بدون ترقية تأمين أو إضافات" },
  "Ask team to confirm insurance": { en: "Ask team to confirm insurance", ar: "اطلب من الفريق تأكيد التأمين" },
};

export const RESIDENCY_LABELS: Record<string, Record<Lang, string>> = {
  "UAE resident": { en: "UAE resident", ar: "مقيم في الإمارات" },
  Tourist: { en: "Tourist", ar: "سائح" },
  "GCC national": { en: "GCC national", ar: "مواطن خليجي" },
};

export function translateLabel(
  canonicalValue: string | undefined,
  labelMap: Record<string, Record<Lang, string>>,
  lang: Lang
): string {
  if (!canonicalValue) return "";
  return labelMap[canonicalValue]?.[lang] ?? canonicalValue;
}

export function translateOptionList(
  canonicalValues: string[],
  labelMap: Record<string, Record<Lang, string>>,
  lang: Lang
): string[] {
  return canonicalValues.map((value) => translateLabel(value, labelMap, lang));
}

// ---------------------------------------------------------------------------
// Extra keyword/alias terms to recognize Arabic user input. These get merged
// into the existing English alias arrays in route.ts (findAliasMatch etc.),
// so Arabic input maps back to the same canonical English key.
// ---------------------------------------------------------------------------

export const CITY_ALIASES_AR: Record<string, string[]> = {
  "Abu Dhabi": ["أبوظبي", "ابوظبي", "ابو ظبي"],
  Dubai: ["دبي"],
  Sharjah: ["الشارقة", "شارجة", "شارقة"],
  "Ras Al-Khaimah": ["رأس الخيمة", "راس الخيمة", "رأس الخيمه"],
  "Al Ain": ["العين"],
  Fujairah: ["الفجيرة", "فجيرة"],
  Ajman: ["عجمان"],
};

export const CAR_TYPE_ALIASES_AR: Record<string, string[]> = {
  Economy: ["اقتصادية", "اقتصادي", "رخيصة", "رخيص"],
  Sedan: ["سيدان"],
  SUV: ["دفع رباعي", "اس يو في"],
  Luxury: ["فاخرة", "فخمة", "مرسيدس", "رنج روفر", "لامبورغيني"],
  Electric: ["كهربائية", "كهربائي", "تسلا"],
  Sports: ["رياضية", "رياضي", "موستنج"],
  Hatchback: ["هاتشباك", "صغيرة", "ميني كوبر"],
  "7-seater": ["7 مقاعد", "سبع مقاعد", "٧ مقاعد"],
  "Monthly rental": ["إيجار شهري", "ايجار شهري", "شهري"],
};

export const RESIDENCY_TERMS_AR = {
  resident: ["مقيم", "مقيم إماراتي", "مقيم اماراتي"],
  tourist: ["سائح", "زائر", "تأشيرة زيارة", "تاشيرة زيارة"],
  gcc: ["مواطن خليجي", "خليجي", "دول مجلس التعاون"],
};

export const INSURANCE_TERMS_AR = [
  "تأمين أساسي",
  "تامين اساسي",
  "بدون تأمين إضافي",
  "بدون تامين اضافي",
  "بدون إضافات",
  "بدون اضافات",
  "تغطية كاملة",
  "تأمين شامل",
  "تامين شامل",
  "صفر تحمل",
  "بدون تحمل",
  "ترقية تأمين",
  "اطلب من الفريق",
  "أكد التأمين",
  "تأكيد التأمين",
];

export const DOCUMENT_TERMS_AR = [
  "المستندات",
  "مستندات",
  "رخصة القيادة",
  "رخصة قيادة",
  "الهوية الإماراتية",
  "الهويه الاماراتيه",
  "جواز السفر",
  "جواز سفر",
  "تأشيرة",
  "تاشيرة",
  "رفعت المستندات",
  "تم رفع",
  "ملفات pdf",
];

export const PAYMENT_INTENT_TERMS_AR = [
  "الدفع الآمن",
  "الدفع الامن",
  "المتابعة للدفع",
  "إتمام الدفع",
  "اتمام الدفع",
  "الدفع الآن",
  "الدفع الان",
  "الدفع الالكتروني",
];

export const PAYMENT_METHOD_TERMS_AR = [
  "نقدا",
  "نقدي",
  "كاش",
  "بطاقة",
  "بطاقة ائتمان",
  "بطاقة إئتمان",
  "ابل باي",
  "آبل باي",
  "الدفع",
  "طريقة الدفع",
  "وديعة",
  "تأمين نقدي",
  "دفعة مقدمة",
  "هل يجب أن أدفع",
  "هل علي أن أدفع",
];

export const PICKUP_DATE_TERMS_AR =
  "اليوم|الليلة|غدا|غدًا|بكرة|الأسبوع القادم|الاسبوع القادم|الشهر القادم|نهاية الأسبوع|نهاية الاسبوع|الاثنين|الثلاثاء|الأربعاء|الاربعاء|الخميس|الجمعة|السبت|الأحد|الاحد";

export const DURATION_TERMS_AR =
  "يوم|أيام|ايام|أسبوع|اسبوع|أسابيع|اسابيع|شهر|أشهر|اشهر|سنة|سنوات";

export const BUDGET_TERMS_AR = "درهم|ميزانية|أقل من|اقل من|يوميا|شهريا";

export const HUMAN_AGENT_TERMS_AR = ["إنسان", "انسان", "موظف", "وكيل", "شخص", "اتصل بي"];
export const DOCS_FAQ_TERMS_AR = [
  "مستند",
  "رخصة",
  "الهوية الإماراتية",
  "الهويه الاماراتيه",
  "جواز السفر",
  "جواز سفر",
  "تأشيرة",
  "تاشيرة",
  "الحد الأدنى للعمر",
  "العمر",
  "السن",
];
export const INSURANCE_FAQ_TERMS_AR = ["تأمين", "تامين", "صفر تحمل", "بدون تحمل"];
export const CROSS_BORDER_TERMS_AR = ["عمان", "السعودية", "عبر الحدود", "الحدود"];
export const TOLL_TERMS_AR = ["سالك", "رسوم", "مخالفة", "غرامة"];
export const FUEL_TERMS_AR = ["وقود", "بنزين", "غاز"];
export const CANCEL_TERMS_AR = ["إلغاء", "الغاء", "استرداد", "سياسة الاسترجاع"];

// ---------------------------------------------------------------------------
// All fixed reply text, per language.
// ---------------------------------------------------------------------------

export const STRINGS = {
  en: {
    pleaseTypeMessage: "Please type a message so I can help with your rental.",
    couldNotReadMessage: "Sorry, I could not read that message. Please try again.",
    askLocation: "Which emirate or pickup location do you need?",
    askPickupDateDuration: (location: string) =>
      `Got it, ${location}. What pickup day and rental duration do you need? For example: tomorrow for 5 days.`,
    askCarType:
      "What car would you like? You can name a model such as Mini Cooper, or choose a type like economy, sedan, SUV, luxury, or 7-seater.",
    carOptionsIntro: "Here are suitable options from our fleet:",
    carOptionsOutro: "Which car would you like to continue with?",
    contactPrompt: (model: string, daily: number, weekly: number, monthly: number) =>
      [
        `Great, I will note ${model} as your preferred car.`,
        `Listed rate: AED ${daily}/day, AED ${weekly}/week, AED ${monthly}/month.`,
        "",
        "What WhatsApp number should our team use for follow-up?",
      ].join("\n"),
    residencyPrompt: (model: string, location: string, daily: number) =>
      [
        `Great, I have ${model} noted for ${location}.`,
        `Rate shown: AED ${daily}/day. Final availability still needs team confirmation.`,
        "",
        "Before documents, are you a UAE resident, GCC national, or tourist?",
      ].join("\n"),
    insurancePrompt:
      "Which insurance package do you want: basic insurance, upgraded/full coverage, or no upgraded insurance/add-ons? You can also ask the team to confirm the exact option for this car.",
    documentsPrompt: (model: string, requirementLines: readonly string[]) =>
      [
        `Perfect. ${model} is noted with your insurance/add-ons preference.`,
        "Before payment, please upload the required documents as PDF:",
        ...requirementLines,
        "",
        "Use the Upload PDFs button below. After upload, I will show secure checkout.",
      ].join("\n"),
    paymentIntentPrompt: (location: string, pickupDate: string, duration: string, model: string, daily: number) =>
      [
        "Documents are received for verification.",
        "Booking summary:",
        `- Pickup location: ${location}`,
        `- Pickup date/duration: ${pickupDate}; ${duration}`,
        `- Car: ${model}`,
        `- Listed rate: AED ${daily}/day`,
        "- Final availability and exact deposit need team confirmation.",
        "",
        "When you are ready, press Proceed to secure payment.",
      ].join("\n"),
    finalPaymentReply:
      "Documents are received. Continue with the secure checkout panel below. Please do not type card details into the chat.",
    requirementsTourist: [
      "- Passport",
      "- Visa",
      "- Home country driving license",
      "- International Driving Permit if required for your nationality",
    ],
    requirementsGcc: ["- GCC driving license", "- Passport or national ID if requested by the team"],
    requirementsResident: ["- UAE driving license", "- Emirates ID", "- Passport copy if requested by the team"],
    paymentMethodReply:
      "Payment is through the secure checkout panel in this chat. You can use the card form or Apple Pay option shown there. Please do not send card details as chat text. Cash is only possible if the team confirms it for your booking, and deposits depend on the car and rental duration.",
    docsFaqReply: [
      "Rental requirements are usually:",
      "- UAE residents: valid UAE driving license + Emirates ID.",
      "- GCC nationals: valid GCC driving license.",
      "- Tourists: passport + visa + home country license. Some nationalities also need an International Driving Permit.",
      "- Minimum age is typically 21-25 depending on car category.",
      "",
      "Are you a UAE resident, GCC national, or tourist?",
    ].join("\n"),
    insuranceFaqReply:
      "Insurance depends on the selected car. You can choose basic insurance, upgraded/full coverage, or ask the team to confirm the exact options. If you do not want upgraded insurance, say: no upgraded insurance or add-ons.",
    humanFaqReply:
      "I can hand this to the team. They will use the contact details from the pre-chat form, or you can type a WhatsApp number here if you want to change it.",
    crossBorderFaqReply:
      "Cross-border driving needs current approval and permits. I cannot confirm it in chat, so the team must check it before booking.",
    tollFaqReply:
      "Salik and parking or traffic fines are usually charged to the renter based on actual usage. The team can confirm current charges before payment.",
    fuelFaqReply:
      "Fuel is usually return-at-same-level or prepaid if offered. We should confirm the exact policy in your booking summary.",
    cancelFaqReply:
      "Cancellation terms depend on the booking type and timing before pickup. The team can confirm the terms before payment.",
    carLineReady: "needs confirmation",
    carLineUnavailable: "unavailable",
    rentalReady: "Rental ready",
    seatsListed: "Seats listed",
    geminiInstruction:
      "Reply only in English, regardless of what language the user writes in.",
  },
  ar: {
    pleaseTypeMessage: "الرجاء كتابة رسالة حتى أتمكن من مساعدتك في الحجز.",
    couldNotReadMessage: "عذرًا، لم أتمكن من قراءة هذه الرسالة. الرجاء المحاولة مرة أخرى.",
    askLocation: "ما هي الإمارة أو موقع الاستلام الذي تحتاجه؟",
    askPickupDateDuration: (location: string) =>
      `تمام، ${location}. ما هو يوم الاستلام ومدة الإيجار التي تحتاجها؟ على سبيل المثال: غدًا لمدة 5 أيام.`,
    askCarType:
      "ما السيارة التي ترغب بها؟ يمكنك ذكر موديل مثل ميني كوبر، أو اختيار نوع مثل اقتصادية، سيدان، دفع رباعي، فاخرة، أو 7 مقاعد.",
    carOptionsIntro: "إليك خيارات مناسبة من أسطولنا:",
    carOptionsOutro: "ما هي السيارة التي ترغب بالمتابعة بها؟",
    contactPrompt: (model: string, daily: number, weekly: number, monthly: number) =>
      [
        `رائع، سأسجل ${model} كسيارتك المفضلة.`,
        `السعر المعلن: ${daily} درهم/يوم، ${weekly} درهم/أسبوع، ${monthly} درهم/شهر.`,
        "",
        "ما هو رقم الواتساب الذي يستخدمه فريقنا للمتابعة؟",
      ].join("\n"),
    residencyPrompt: (model: string, location: string, daily: number) =>
      [
        `رائع، لقد سجلت ${model} لموقع ${location}.`,
        `السعر المعلن: ${daily} درهم/يوم. التوفر النهائي يحتاج إلى تأكيد الفريق.`,
        "",
        "قبل المستندات، هل أنت مقيم في الإمارات، مواطن خليجي، أم سائح؟",
      ].join("\n"),
    insurancePrompt:
      "ما هي باقة التأمين التي تريدها: تأمين أساسي، ترقية/تغطية كاملة، أم بدون ترقية تأمين أو إضافات؟ يمكنك أيضًا أن تطلب من الفريق تأكيد الخيار الدقيق لهذه السيارة.",
    documentsPrompt: (model: string, requirementLines: readonly string[]) =>
      [
        `ممتاز. تم تسجيل ${model} مع تفضيل التأمين/الإضافات الخاص بك.`,
        "قبل الدفع، الرجاء رفع المستندات المطلوبة بصيغة PDF:",
        ...requirementLines,
        "",
        "استخدم زر رفع ملفات PDF أدناه. بعد الرفع، سأعرض لك صفحة الدفع الآمن.",
      ].join("\n"),
    paymentIntentPrompt: (location: string, pickupDate: string, duration: string, model: string, daily: number) =>
      [
        "تم استلام المستندات للتحقق.",
        "ملخص الحجز:",
        `- موقع الاستلام: ${location}`,
        `- تاريخ الاستلام/المدة: ${pickupDate}؛ ${duration}`,
        `- السيارة: ${model}`,
        `- السعر المعلن: ${daily} درهم/يوم`,
        "- التوفر النهائي والوديعة الدقيقة يحتاجان إلى تأكيد الفريق.",
        "",
        "عندما تكون جاهزًا، اضغط على المتابعة للدفع الآمن.",
      ].join("\n"),
    finalPaymentReply:
      "تم استلام المستندات. تابع مع لوحة الدفع الآمن أدناه. الرجاء عدم كتابة بيانات البطاقة في المحادثة.",
    requirementsTourist: [
      "- جواز السفر",
      "- التأشيرة",
      "- رخصة القيادة من بلدك",
      "- رخصة القيادة الدولية إذا كانت مطلوبة لجنسيتك",
    ],
    requirementsGcc: ["- رخصة قيادة خليجية", "- جواز السفر أو الهوية الوطنية إذا طلبها الفريق"],
    requirementsResident: ["- رخصة القيادة الإماراتية", "- الهوية الإماراتية", "- نسخة من جواز السفر إذا طلبها الفريق"],
    paymentMethodReply:
      "الدفع يتم عبر لوحة الدفع الآمن في هذه المحادثة. يمكنك استخدام نموذج البطاقة أو خيار Apple Pay الموضح هناك. الرجاء عدم إرسال بيانات البطاقة كنص في المحادثة. الدفع النقدي ممكن فقط إذا أكده الفريق لحجزك، والوديعة تعتمد على السيارة ومدة الإيجار.",
    docsFaqReply: [
      "متطلبات الإيجار عادة تكون:",
      "- المقيمون في الإمارات: رخصة قيادة إماراتية سارية + الهوية الإماراتية.",
      "- مواطنو دول الخليج: رخصة قيادة خليجية سارية.",
      "- السياح: جواز سفر + تأشيرة + رخصة من بلدهم. بعض الجنسيات تحتاج أيضًا رخصة قيادة دولية.",
      "- الحد الأدنى للعمر عادة بين 21-25 حسب فئة السيارة.",
      "",
      "هل أنت مقيم في الإمارات، مواطن خليجي، أم سائح؟",
    ].join("\n"),
    insuranceFaqReply:
      "التأمين يعتمد على السيارة المختارة. يمكنك اختيار تأمين أساسي، ترقية/تغطية كاملة، أو أن تطلب من الفريق تأكيد الخيارات الدقيقة. إذا كنت لا تريد ترقية التأمين، قل: بدون ترقية تأمين أو إضافات.",
    humanFaqReply:
      "يمكنني تحويل هذا إلى الفريق. سيستخدمون بيانات التواصل من النموذج المبدئي، أو يمكنك كتابة رقم واتساب هنا إذا أردت تغييره.",
    crossBorderFaqReply:
      "القيادة عبر الحدود تحتاج إلى موافقة وتصاريح حالية. لا يمكنني تأكيد ذلك في المحادثة، لذا يجب أن يتحقق الفريق قبل الحجز.",
    tollFaqReply:
      "رسوم سالك أو مخالفات الوقوف والمرور تُحمَّل عادة على المستأجر حسب الاستخدام الفعلي. يمكن للفريق تأكيد الرسوم الحالية قبل الدفع.",
    fuelFaqReply:
      "الوقود عادة يُعاد بنفس المستوى أو يُدفع مسبقًا إن وُجد هذا الخيار. يجب علينا تأكيد السياسة الدقيقة في ملخص حجزك.",
    cancelFaqReply:
      "شروط الإلغاء تعتمد على نوع الحجز والتوقيت قبل الاستلام. يمكن للفريق تأكيد الشروط قبل الدفع.",
    carLineReady: "يحتاج تأكيد",
    carLineUnavailable: "غير متاح",
    rentalReady: "جاهزة للإيجار",
    seatsListed: "المقاعد مذكورة",
    geminiInstruction:
      "قم بالرد باللغة العربية الفصحى فقط، بغض النظر عن اللغة التي يكتب بها المستخدم.",
  },
} as const;

export function t(lang: Lang) {
  return STRINGS[lang];
}
