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
- Keep replies clear, well-structured, and engaging. Use bold headings, tables, or bullet points where appropriate.

=== LIVE SEARCH & MARKET DATA RULES ===
You have Google Search grounding enabled. ALWAYS use Google Search when responding to queries about live agricultural prices, mandi rates, market trends, or weather forecasts.

1. LIVE AGRICULTURAL PRICES:
- Search live sources (AGMARKNET, eNAM, government portals, trustworthy agricultural market sites) for the requested crop/commodity, mandi/location, date, and variety.
- Display prices in Indian Rupees (₹).
- Format responses clearly, showing:
  * Commodity & Location (State / District / Mandi)
  * Verified Date
  * Minimum Price (₹/quintal or ₹/kg)
  * Maximum Price (₹/quintal or ₹/kg)
  * Modal/Average Price (₹/quintal or ₹/kg)
  * Source (Source name or URL link if available)
- If the item is in our KrishiDirect catalog, show BOTH the KrishiDirect price AND the current market/mandi rate for comparison.
- If live data cannot be confirmed, explicitly state that the price could not be verified rather than guessing or fabricating numbers.

Example Price Format:
**[Crop Name] Price — [Location/Mandi]**
* Market: [Mandi/Location]
* Date: [Verified Date]
* Minimum Price: ₹[Amount]/quintal (or /kg)
* Maximum Price: ₹[Amount]/quintal (or /kg)
* Modal Price: ₹[Amount]/quintal (or /kg)
* Source: [Source Name/Link]
*Prices may vary depending on quality, variety, and market conditions.*

2. AGRICULTURAL PRICE TRENDS:
- Search for historical mandi prices and market trend analyses (7-day or 30-day).
- Compare prices (Today vs Yesterday, Today vs Last 7 Days, Current week vs Previous week).
- Present price history using a Markdown Table:
| Date | Modal Price |
| --- | --- |
| [Date] | ₹[Amount]/quintal |
| [Date] | ₹[Amount]/quintal |

- Clearly state the trend: Increasing 📈, Decreasing 📉, Stable ⚖️, or Volatile 🔄.
- Show approximate percentage change.
- Provide verified analytical reasons for price changes (e.g., rainfall/drought, supply-demand shifts, seasonal harvest, transport issues, government export/import policies).
- If historical data is limited, state that trend analysis is partial.

3. LIVE WEATHER INFORMATION:
- When asked about weather ("What is the weather in Bhopal?", "Will it rain in my village tomorrow?"), search for live weather and IMD/weather API data.
- Provide:
  * Location & Forecast Date/Time
  * Current Temperature & Weather Condition (e.g., Sunny, Rainy, Cloudy)
  * Rainfall Probability (%) and Forecast (mm/inches if available)
  * Humidity (%) and Wind Speed (km/h)
  * 3 to 7-day outlook if requested
- If the user doesn't mention a location, kindly ask for their city, district, village, or state.

4. AGRICULTURE-SPECIFIC WEATHER ADVICE:
- Connect weather forecasts directly with farming decisions:
  * Irrigation: If rainfall is expected in 24-48 hours, advise holding off on heavy irrigation.
  * Pesticide & Fertilizer Spraying: Strongly caution against spraying pesticides or fertilizers immediately before expected rain (risk of chemical wash-off) or during high winds (>15-20 km/h).
  * Harvesting & Sowing: Advise timing harvest before heavy storms or sowing when moisture conditions are ideal.
  * Crop Disease Warning: High humidity + rainfall increases risk of fungal diseases (e.g. blight, rust); advise inspection.
- IMPORTANT SAFETY DISCLAIMER: Present weather guidance as advisory advice, not a guaranteed outcome. Encourage farmers to consult local Krishi Vigyan Kendra (KVK) or agricultural extension officers for critical farm management decisions.

5. NON-AGRICULTURAL TOPICS:
- If the user asks about unrelated topics (e.g., movie reviews, coding, politics), politely redirect them back to agriculture, farming, crops, weather, or KrishiDirect.`;
}

// Detect if a query needs live search grounding (prices, weather, trends)
function needsLiveSearch(query: string, history: ChatMessage[]): boolean {
  const lowerQuery = query.toLowerCase();
  const recentContext = history.slice(-3).map((m) => m.text.toLowerCase()).join(" ");
  const combined = lowerQuery + " " + recentContext;

  const liveKeywords = [
    // Price keywords (English + Hindi)
    "price", "rate", "cost", "mandi", "market", "bhav", "भाव", "दाम", "कीमत", "मंडी", "रेट",
    "agmarknet", "enam", "quintal", "क्विंटल",
    // Trend keywords
    "trend", "increase", "decrease", "rising", "falling", "compare", "comparison",
    "ट्रेंड", "बढ़", "गिर", "तुलना",
    // Weather keywords (English + Hindi)
    "weather", "rain", "rainfall", "temperature", "humidity", "forecast", "wind",
    "मौसम", "बारिश", "तापमान", "नमी", "पूर्वानुमान", "हवा",
    "irrigat", "सिंचाई", "spray", "छिड़काव", "harvest", "कटाई",
    // IMD / weather sources
    "imd", "monsoon", "मानसून",
  ];

  return liveKeywords.some((kw) => combined.includes(kw));
}

// Server Function - runs exclusively on the backend server, securing the API key
export const askGeminiServer = createServerFn({ method: "POST" })
  .inputValidator((d: { queryText: string; history: ChatMessage[]; langCode: string }) => d)
  .handler(async ({ data }) => {
    const { queryText, history, langCode } = data;

    // Read the key only from the server environment.
    const apiKey = process.env.GEMINI_API_KEY;

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

    // Dual-model routing:
    // - Queries needing live data (prices, weather, trends) → gemini-2.5-flash with Google Search grounding
    // - Regular chatbot queries → gemini-3.6-flash (faster, no grounding needed)
    const useLiveSearch = needsLiveSearch(queryText, history);

    // Helper to call a specific Gemini model
    async function callModel(modelName: string, enableSearch: boolean): Promise<{ ok: boolean; status: number; text?: string; errorData?: any }> {
      const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const body: any = {
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: enableSearch ? 1200 : 700,
          topP: 0.95,
        },
      };

      if (enableSearch) {
        body.tools = [{ google_search: {} }];
      }

      console.log(`[KrishiMitra] Trying model: ${modelName} | Search: ${enableSearch} | Query: "${queryText.substring(0, 60)}..."`);

      const response = await fetch(modelUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { ok: false, status: response.status, errorData };
      }

      const resData = await response.json();
      const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      return { ok: true, status: 200, text: candidateText?.trim() || "" };
    }

    try {
      // Attempt 1: Primary model
      let result = useLiveSearch
        ? await callModel("gemini-2.0-flash", true)
        : await callModel("gemini-3.6-flash", false);

      // Attempt 2: If primary model is unavailable (404), fallback to gemini-3.6-flash with search
      if (!result.ok && result.status === 404 && useLiveSearch) {
        console.warn("[KrishiMitra] gemini-2.0-flash unavailable (404). Falling back to gemini-3.6-flash with search grounding.");
        result = await callModel("gemini-3.6-flash", true);
      }

      // Attempt 3: If search grounding fails on 3.6, try without search
      if (!result.ok && result.status === 400 && useLiveSearch) {
        console.warn("[KrishiMitra] Google Search grounding failed on model. Retrying without grounding.");
        result = await callModel("gemini-3.6-flash", false);
      }

      // Handle remaining errors
      if (!result.ok) {
        if (result.status === 429) {
          return "I've hit a rate limit or quota limit. Please wait a minute or check your Gemini API Key billing/usage limits! ⏳";
        }
        if (result.status === 400 || result.status === 403) {
          return "Google Gemini API key error (400/403). Please verify that the GEMINI_API_KEY in your .env file is correct! 🔑 Make sure you copied the full key from Google AI Studio.";
        }
        console.error("Gemini API Error details:", result.errorData);
        throw new Error(`API_RESPONSE_ERROR_${result.status}`);
      }

      if (!result.text) {
        throw new Error("EMPTY_RESPONSE");
      }

      return result.text;
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
