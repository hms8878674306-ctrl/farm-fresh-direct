import { products, farmers } from "./data";
import { getRegionalLanguage } from "./i18n/languages";

export type ChatMessage = {
  role: "user" | "model";
  text: string;
};

// Retrieve API key from localStorage or env variable
export function getGeminiApiKey(): string | null {
  if (typeof window !== "undefined") {
    const localKey = localStorage.getItem("krishi-gemini-key");
    if (localKey) return localKey;
  }
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || null;
}

export function saveGeminiApiKey(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("krishi-gemini-key", key);
  }
}

export function removeGeminiApiKey() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("krishi-gemini-key");
  }
}

// Generate the store context system prompt
function buildSystemPrompt(langCode: string): string {
  const langDetails = getRegionalLanguage(langCode);
  const langName = langDetails ? langDetails.englishLabel : "English";
  const langNative = langDetails ? langDetails.nativeLabel : "English";

  const productList = products
    .map(
      (p) =>
        `- **${p.name}** (ID: ${p.id}): ₹${p.price} per ${p.unit} (listed at ₹${p.prevPrice}). Stock: ${p.stock} units. Freshness: ${p.freshness}. Category: ${p.category}. Sold by Farmer ID: ${p.farmerId} (${p.distanceKm} km away)`
    )
    .join("\n");

  const farmerList = farmers
    .map(
      (f) =>
        `- **${f.name}** (ID: ${f.id}): Specialty is ${f.specialty}, located in ${f.location}, Rating: ${f.rating}/5.0 (Verified: ${f.verified ? "Yes" : "No"})`
    )
    .join("\n");

  return `You are "KrishiMitra", a friendly, helpful, and highly intelligent multilingual AI assistant for the "KrishiDirect" platform.

KrishiDirect is a direct farm-to-consumer digital marketplace in India.
Key Features of KrishiDirect:
1. Direct connection between farmers and consumers, eliminating middlemen.
2. Fair prices for buyers and maximum revenue for local farmers.
3. Fresh, local produce delivered on the same day.
4. Flexible payment options including Cash on Delivery (COD) and secure digital payments.

REAL-TIME STORE CATALOG:
${productList}

REGISTERED LOCAL FARMERS:
${farmerList}

IMPORTANT INSTRUCTIONS:
- You must respond in ${langName} (${langNative}) and use the correct script (e.g. Hindi in Devanagari script, Tamil in Tamil script, etc.). Keep the tone warm, welcoming, respectful, and culturally appropriate (e.g. using Namaste or Vanakkam where suited).
- Guide the user on what crops are in-season, who sells them, and where.
- Recommend specific products based on what they ask. For example, if they want tomatoes, point them to Ramesh Patel's Vine Tomatoes.
- Inform users that they can negotiate prices directly with farmers by clicking "Negotiate" or "Chat" on the product pages.
- Keep replies succinct and engaging (aim for 2-3 sentences), so they can easily be read on a mobile screen and spoken aloud using Text-to-Speech engines.
- Do not make up products or farmers that are not listed in the real-time store catalog above.
- If the user asks about something unrelated to farming, agriculture, or KrishiDirect, politely redirect them back to agricultural subjects.`;
}

export async function askGemini(
  queryText: string,
  history: ChatMessage[],
  langCode: string
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const systemInstruction = buildSystemPrompt(langCode);

  // Map the local message structure to the Gemini API format
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    {
      role: "user",
      parts: [{ text: queryText }],
    },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 600,
          topP: 0.95,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error details:", errorData);
      throw new Error(`API_RESPONSE_ERROR_${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("EMPTY_RESPONSE");
    }

    return candidateText.trim();
  } catch (error: any) {
    console.error("Error in askGemini:", error);
    throw error;
  }
}
