import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "hi" | "mr";

type Dictionary = Record<string, string> & {
  home: string;
  shop: string;
  farmers: string;
  track: string;
  dashboard: string;
  farmerDashboard: string;
  listings: string;
  orders: string;
  chat: string;
  signIn: string;
  signOut: string;
  cart: string;
  language: string;
  addToCart: string;
  addedToCart: string;
  total: string;
  per: string;
  farmerMode: string;
  consumerMode: string;
};

const en: Dictionary = {
  home: "Home",
  shop: "Shop",
  farmers: "Farmers",
  track: "Track",
  dashboard: "Dashboard",
  farmerDashboard: "Sales",
  listings: "Listings",
  orders: "Orders",
  chat: "Chat",
  signIn: "Sign in",
  signOut: "Sign out",
  cart: "Cart",
  language: "Language",
  addToCart: "Add to cart",
  addedToCart: "Added to cart",
  total: "total",
  per: "per",
  farmerMode: "Farmer workspace",
  consumerMode: "Consumer market",
  heroEyebrow: "Seasonal picks",
  heroTitleA: "Freshness Direct",
  heroTitleB: "From Farm.",
  heroCopy: "Real food. Real farmers. Zero middlemen. Order today, get it tomorrow - pay cash on delivery.",
  trustVerified: "Verified Farmers",
  trustMiddleman: "No Middleman",
  trustPayment: "Secure Payment + COD",
  trustDelivery: "Same Day Delivery",
  aiPicks: "AI Picks for You",
  inSeason: "In Season Near You",
  inSeasonCopy: "Based on the season, your area, and freshness today.",
  viewAll: "View all",
  farmerStories: "Real People, Real Farms",
  meetFarmers: "Meet Your Farmers",
  specialty: "Specialty",
  farmerHeroTitle: "Good day, farmer. Your market desk is ready.",
  farmerHeroCopy: "Add today's produce, watch buyer demand, respond to offers, and keep your order work moving from one place.",
  addListing: "Add listing",
  buyerOffers: "Buyer offers",
  quickListing: "Quick listing",
  addCropFast: "Add crop in 30 seconds",
  cropName: "Crop name, e.g. Tomato",
  pricePerKg: "Price / kg",
  stockKg: "Stock kg",
  publishListing: "Publish listing",
  saving: "Saving...",
  fullListingHint: "For full image and details, use the Listings button after saving.",
  activeListings: "Active listings",
  buyerChats: "Buyer chats",
  lowStock: "Low stock",
  listedValue: "Listed value",
  today: "Today",
  workChecklist: "Work checklist",
  taskOffers: "Review buyer offers",
  taskStock: "Update today's stock",
  taskPack: "Pack pending orders",
  taskPickup: "Check delivery pickup",
  demand: "Demand",
  marketSignals: "Market signals",
  buyerInterestHigh: "Buyer interest high",
  buyerInterestRising: "Buyer interest rising",
  buyerInterestSteady: "Buyer interest steady",
  manageListings: "Manage listings",
  manageListingsCopy: "Open your full listing manager, add images, and review product stock.",
  prepareOrders: "Prepare orders",
  prepareOrdersCopy: "Check pending order flow and delivery status for the day.",
  negotiateOffers: "Negotiate offers",
  negotiateOffersCopy: "Open buyer conversations and respond from the farmer side.",
  tutorialTitle: "How to use this website",
  tutorialSubtitle: "Simple steps for farmers and first-time users.",
  tutorial1Title: "Add your crop",
  tutorial1Body: "Enter crop name, price, and stock. Press Publish listing.",
  tutorial2Title: "Check buyer offers",
  tutorial2Body: "Open Chat to see buyer negotiations and reply.",
  tutorial3Title: "Use voice help",
  tutorial3Body: "Press the microphone and say the price, for example: fifty rupees.",
  tutorial4Title: "Call support",
  tutorial4Body: "For demo help, call the toll-free number shown on the website.",
  tollFree: "Toll-free: 1800-123-4567",
  voicePrice: "Voice price",
  voicePriceHint: "Say a price like 45 rupees",
  listening: "Listening...",
  voiceUnsupported: "Voice input needs Chrome or Edge browser.",
  voiceNoPrice: "I could not find a price. Please say only the amount.",
  voicePriceSet: "Price set",
};

const hi: Dictionary = {
  ...en,
  home: "होम",
  shop: "बाज़ार",
  farmers: "किसान",
  track: "ट्रैक",
  dashboard: "डैशबोर्ड",
  farmerDashboard: "बिक्री",
  listings: "लिस्टिंग",
  orders: "ऑर्डर",
  chat: "चैट",
  signIn: "लॉग इन",
  signOut: "लॉग आउट",
  cart: "कार्ट",
  language: "भाषा",
  addToCart: "कार्ट में जोड़ें",
  addedToCart: "कार्ट में जुड़ा",
  total: "कुल",
  per: "प्रति",
  farmerMode: "किसान कार्यक्षेत्र",
  consumerMode: "ग्राहक बाज़ार",
  heroEyebrow: "मौसमी चुनाव",
  heroTitleA: "ताज़गी सीधे",
  heroTitleB: "खेत से.",
  heroCopy: "असली खाना, असली किसान, कोई बिचौलिया नहीं। आज ऑर्डर करें, कल पाएं - कैश ऑन डिलीवरी.",
  trustVerified: "सत्यापित किसान",
  trustMiddleman: "कोई बिचौलिया नहीं",
  trustPayment: "सुरक्षित भुगतान + COD",
  trustDelivery: "उसी दिन डिलीवरी",
  aiPicks: "आपके लिए सुझाव",
  inSeason: "आपके पास मौसमी चीजें",
  inSeasonCopy: "मौसम, आपके इलाके और आज की ताज़गी के आधार पर.",
  viewAll: "सब देखें",
  farmerStories: "असली लोग, असली खेत",
  meetFarmers: "अपने किसानों से मिलें",
  specialty: "विशेषता",
  farmerHeroTitle: "नमस्ते किसान। आपका बाज़ार डेस्क तैयार है।",
  farmerHeroCopy: "आज की फसल जोड़ें, खरीदार मांग देखें, ऑफर का जवाब दें और ऑर्डर संभालें.",
  addListing: "लिस्टिंग जोड़ें",
  buyerOffers: "खरीदार ऑफर",
  quickListing: "त्वरित लिस्टिंग",
  addCropFast: "30 सेकंड में फसल जोड़ें",
  cropName: "फसल का नाम, जैसे टमाटर",
  pricePerKg: "कीमत / किलो",
  stockKg: "स्टॉक किलो",
  publishListing: "लिस्टिंग प्रकाशित करें",
  saving: "सेव हो रहा है...",
  fullListingHint: "पूरी फोटो और जानकारी के लिए सेव करने के बाद लिस्टिंग बटन उपयोग करें.",
  activeListings: "सक्रिय लिस्टिंग",
  buyerChats: "खरीदार चैट",
  lowStock: "कम स्टॉक",
  listedValue: "लिस्टेड मूल्य",
  today: "आज",
  workChecklist: "काम की सूची",
  taskOffers: "खरीदार ऑफर देखें",
  taskStock: "आज का स्टॉक अपडेट करें",
  taskPack: "बाकी ऑर्डर पैक करें",
  taskPickup: "डिलीवरी पिकअप जांचें",
  demand: "मांग",
  marketSignals: "बाज़ार संकेत",
  buyerInterestHigh: "खरीदार रुचि अधिक",
  buyerInterestRising: "खरीदार रुचि बढ़ रही है",
  buyerInterestSteady: "खरीदार रुचि स्थिर",
  manageListings: "लिस्टिंग संभालें",
  manageListingsCopy: "पूरी लिस्टिंग खोलें, फोटो जोड़ें और स्टॉक देखें.",
  prepareOrders: "ऑर्डर तैयार करें",
  prepareOrdersCopy: "दिन के ऑर्डर और डिलीवरी स्थिति देखें.",
  negotiateOffers: "ऑफर पर बात करें",
  negotiateOffersCopy: "खरीदार चैट खोलें और किसान की तरफ से जवाब दें.",
  tutorialTitle: "वेबसाइट कैसे उपयोग करें",
  tutorialSubtitle: "किसानों और नए उपयोगकर्ताओं के लिए आसान कदम.",
  tutorial1Title: "अपनी फसल जोड़ें",
  tutorial1Body: "फसल का नाम, कीमत और स्टॉक डालें। प्रकाशित करें दबाएं.",
  tutorial2Title: "खरीदार ऑफर देखें",
  tutorial2Body: "चैट खोलें और खरीदार से मोलभाव करें.",
  tutorial3Title: "आवाज़ सहायता उपयोग करें",
  tutorial3Body: "माइक दबाएं और कीमत बोलें, जैसे पचास रुपये.",
  tutorial4Title: "सहायता पर कॉल करें",
  tutorial4Body: "डेमो सहायता के लिए वेबसाइट पर दिया टोल-फ्री नंबर देखें.",
  tollFree: "टोल-फ्री: 1800-123-4567",
  voicePrice: "आवाज़ से कीमत",
  voicePriceHint: "कीमत बोलें जैसे 45 रुपये",
  listening: "सुन रहा है...",
  voiceUnsupported: "आवाज़ इनपुट के लिए Chrome या Edge चाहिए.",
  voiceNoPrice: "कीमत समझ नहीं आई। कृपया सिर्फ रकम बोलें.",
  voicePriceSet: "कीमत सेट हो गई",
};

const mr: Dictionary = {
  ...en,
  home: "होम",
  shop: "बाजार",
  farmers: "शेतकरी",
  track: "ट्रॅक",
  dashboard: "डॅशबोर्ड",
  farmerDashboard: "विक्री",
  listings: "यादी",
  orders: "ऑर्डर",
  chat: "चॅट",
  signIn: "लॉग इन",
  signOut: "लॉग आउट",
  cart: "कार्ट",
  language: "भाषा",
  addToCart: "कार्टमध्ये जोडा",
  addedToCart: "कार्टमध्ये जोडले",
  total: "एकूण",
  per: "प्रति",
  farmerMode: "शेतकरी कार्यक्षेत्र",
  consumerMode: "ग्राहक बाजार",
  heroEyebrow: "हंगामी निवड",
  heroTitleA: "ताजेपणा थेट",
  heroTitleB: "शेतातून.",
  heroCopy: "खरे अन्न, खरे शेतकरी, मध्यस्थ नाही. आज ऑर्डर करा, उद्या मिळवा - कॅश ऑन डिलिव्हरी.",
  trustVerified: "सत्यापित शेतकरी",
  trustMiddleman: "मध्यस्थ नाही",
  trustPayment: "सुरक्षित पेमेंट + COD",
  trustDelivery: "त्याच दिवशी डिलिव्हरी",
  aiPicks: "तुमच्यासाठी निवड",
  inSeason: "तुमच्या जवळ हंगामी",
  inSeasonCopy: "हंगाम, तुमचा भाग आणि आजची ताजेपणा यावर आधारित.",
  viewAll: "सर्व पहा",
  farmerStories: "खरे लोक, खरी शेती",
  meetFarmers: "आपल्या शेतकऱ्यांना भेटा",
  specialty: "विशेषता",
  farmerHeroTitle: "नमस्कार शेतकरी. तुमचा बाजार डेस्क तयार आहे.",
  farmerHeroCopy: "आजचा माल जोडा, खरेदीदारांची मागणी पाहा, ऑफरला उत्तर द्या आणि ऑर्डर सांभाळा.",
  addListing: "यादी जोडा",
  buyerOffers: "खरेदीदार ऑफर",
  quickListing: "जलद यादी",
  addCropFast: "30 सेकंदात पीक जोडा",
  cropName: "पीक नाव, उदा. टोमॅटो",
  pricePerKg: "किंमत / किलो",
  stockKg: "स्टॉक किलो",
  publishListing: "यादी प्रकाशित करा",
  saving: "सेव्ह होत आहे...",
  fullListingHint: "पूर्ण फोटो आणि माहिती साठी सेव केल्यानंतर यादी बटण वापरा.",
  activeListings: "सक्रिय यादी",
  buyerChats: "खरेदीदार चॅट",
  lowStock: "कमी स्टॉक",
  listedValue: "यादी मूल्य",
  today: "आज",
  workChecklist: "कामाची यादी",
  taskOffers: "खरेदीदार ऑफर पहा",
  taskStock: "आजचा स्टॉक अपडेट करा",
  taskPack: "बाकी ऑर्डर पॅक करा",
  taskPickup: "डिलिव्हरी पिकअप तपासा",
  demand: "मागणी",
  marketSignals: "बाजार संकेत",
  buyerInterestHigh: "खरेदीदारांची रुची जास्त",
  buyerInterestRising: "खरेदीदारांची रुची वाढते आहे",
  buyerInterestSteady: "खरेदीदारांची रुची स्थिर",
  manageListings: "यादी सांभाळा",
  manageListingsCopy: "पूर्ण यादी उघडा, फोटो जोडा आणि स्टॉक पहा.",
  prepareOrders: "ऑर्डर तयार करा",
  prepareOrdersCopy: "आजच्या ऑर्डर आणि डिलिव्हरी स्थिती पहा.",
  negotiateOffers: "ऑफरवर बोला",
  negotiateOffersCopy: "खरेदीदार चॅट उघडा आणि शेतकरी म्हणून उत्तर द्या.",
  tutorialTitle: "वेबसाइट कशी वापरावी",
  tutorialSubtitle: "शेतकरी आणि नवीन वापरकर्त्यांसाठी सोपे टप्पे.",
  tutorial1Title: "आपले पीक जोडा",
  tutorial1Body: "पीक नाव, किंमत आणि स्टॉक भरा. प्रकाशित करा दाबा.",
  tutorial2Title: "खरेदीदार ऑफर पहा",
  tutorial2Body: "चॅट उघडा आणि खरेदीदाराशी भाव करा.",
  tutorial3Title: "आवाज मदत वापरा",
  tutorial3Body: "माइक दाबा आणि किंमत बोला, जसे पन्नास रुपये.",
  tutorial4Title: "मदतीसाठी कॉल करा",
  tutorial4Body: "डेमो मदतीसाठी वेबसाइटवरील टोल-फ्री नंबर पहा.",
  tollFree: "टोल-फ्री: 1800-123-4567",
  voicePrice: "आवाजाने किंमत",
  voicePriceHint: "किंमत बोला जसे 45 रुपये",
  listening: "ऐकत आहे...",
  voiceUnsupported: "आवाज इनपुटसाठी Chrome किंवा Edge हवा.",
  voiceNoPrice: "किंमत समजली नाही. कृपया फक्त रक्कम बोला.",
  voicePriceSet: "किंमत सेट झाली",
};

const dictionaries: Record<Language, Dictionary> = { en, hi, mr };

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
  speechLocale: string;
};

const LanguageCtx = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: en,
  speechLocale: "en-IN",
});

const isLanguage = (value: unknown): value is Language =>
  value === "en" || value === "hi" || value === "mr";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("krishi-language");
    if (isLanguage(saved)) setLanguageState(saved);
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("krishi-language", nextLanguage);
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: dictionaries[language],
      speechLocale: language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN",
    }),
    [language]
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}

export const useLanguage = () => useContext(LanguageCtx);
