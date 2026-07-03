const endpoint = "http://localhost:3000/api/chat";

const customer = {
  name: "Simulation User",
  phone: "+971 50 000 0000",
  email: "simulation@gmail.com",
};

const paymentQuestions = [
  "do i need to pay in cash?",
  "Do I have to pay cash?",
  "can I pay by card?",
  "cash or card?",
  "is apple pay accepted?",
  "how do I pay?",
  "do you take a deposit?",
  "how much security deposit?",
  "can i pay cash when the car arrives?",
  "should I send my card number here?",
];

const faqQuestions = [
  "what documents do I need?",
  "minimum age?",
  "can I drive to Oman?",
  "what about salik?",
  "fuel policy?",
  "can you deliver to dxb airport?",
  "what is the cancellation policy?",
  "do you have insurance?",
  "I want to talk to a human",
  "what if there is an accident?",
];

const bookingStarts = [
  "I need a sedan in Dubai tomorrow for 3 days under AED 200 daily",
  "SUV in Abu Dhabi for one week, budget AED 350 per day",
  "monthly rental in Sharjah under AED 3000",
  "I want a 7 seater in Ajman next week",
  "show me economy cars in Dubai for tomorrow",
  "Toyota Corolla for 1 week in Dubai",
  "I need a luxury car in Abu Dhabi this weekend",
  "budget car for today in Sharjah",
  "Tesla in Dubai for 3 days",
  "Honda Civic monthly rental",
];

const vagueMessages = [
  "hello",
  "hi",
  "car rental",
  "price?",
  "available?",
  "help me book",
  "need car",
  "quick question",
  "please help",
  "what cars do you have?",
];

const typoMessages = [
  "doo i ned to pay cash",
  "can i py by crd",
  "deposite how much",
  "dubia sedan tomorow",
  "i ned toyota corola",
  "wat documnts needed",
  "insurence included?",
  "can delivr to airpot",
  "paymnt methd?",
  "cashh acepted?",
];

const pools = [paymentQuestions, faqQuestions, bookingStarts, vagueMessages, typoMessages];

function messageFor(index) {
  const pool = pools[index % pools.length];
  return pool[Math.floor(index / pools.length) % pool.length];
}

function isPaymentMessage(message) {
  return /\b(cash|card|pay|payment|deposit|apple pay|crd|deposite|paymnt|cashh)\b/i.test(message);
}

function hasPaymentAnswer(reply) {
  return /\b(payment|pay|cash|card|checkout|deposit|secure)\b/i.test(reply);
}

function dodgesWithPickup(reply) {
  return /\b(which emirate|pickup location|what pickup location|where do you need|pickup date)\b/i.test(reply);
}

async function ask(message) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-quicko-simulation": "fallback",
    },
    body: JSON.stringify({ message, messages: [], customer }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

const failures = [];

for (let index = 0; index < 500; index += 1) {
  const message = messageFor(index);
  const data = await ask(message);
  const reply = data.reply ?? "";

  if (!reply.trim()) {
    failures.push({ index, message, reason: "empty reply", reply });
    continue;
  }

  if (isPaymentMessage(message) && (!hasPaymentAnswer(reply) || dodgesWithPickup(reply))) {
    failures.push({ index, message, reason: "payment question not answered directly", reply });
  }
}

console.log(JSON.stringify({ total: 500, failures: failures.slice(0, 20), failureCount: failures.length }, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
