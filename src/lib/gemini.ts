import { createServerFn } from "@tanstack/react-start";
import { products, farmers } from "./data";
import { getRegionalLanguage } from "./i18n/languages";

export type ChatMessage = {
  role: "user" | "model";
  text: string;
};

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
- LIVE PRICE LOOKUPS: You have access to Google Search. When a user asks about the price of ANY crop or vegetable (whether or not it is in the store catalog), use Google Search to find the current market/mandi price in India (in ₹). Search for terms like "[crop name] mandi price today India" or "[crop name] current price per kg India". Always show the live searched price and mention it is the current market rate.
- For products IN our store catalog, show BOTH the KrishiDirect price (from the catalog above) AND the current market price you find via search, so users can see they are getting a fair deal.
- For products NOT in our store catalog, just show the current live mandi price from search results.
- If the user asks about something unrelated to farming, agriculture, or KrishiDirect, politely redirect them back to agricultural subjects.`;
}

// Server Function - runs exclusively on the backend server, securing the API key
export const askGeminiServer = createServerFn({ method: "POST" })
  .inputValidator((d: { queryText: string; history: ChatMessage[]; langCode: string }) => d)
  .handler(async ({ data }) => {
    const { queryText, history, langCode } = data;

    // Read API key from server environment
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      (import.meta.env.VITE_GEMINI_API_KEY as string);

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
          tools: [{ google_search: {} }], // Enable Google Search grounding for live market prices
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 700,
            topP: 0.95,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return "I've hit a rate limit or quota limit. Please wait a minute or check your Gemini API Key billing/usage limits! ⏳";
        }
        if (response.status === 400 || response.status === 403) {
          return "Google Gemini API key error (400/403). Please verify that the GEMINI_API_KEY in your .env file is correct and has access to Gemini 2.5 Flash! 🔑 Make sure you copied the full key from Google AI Studio.";
        }
        const errorData = await response.json().catch(() => ({}));
        console.error("Gemini API Error details:", errorData);
        throw new Error(`API_RESPONSE_ERROR_${response.status}`);
      }

      const resData = await response.json();
      const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error("EMPTY_RESPONSE");
      }

      return candidateText.trim();
    } catch (error: any) {
      console.error("Error in askGeminiServer:", error);
      throw error;
    }
  });

export async function askGemini(
  queryText: string,
  history: ChatMessage[],
  langCode: string
): Promise<string> {
  return askGeminiServer({ data: { queryText, history, langCode } });
}
