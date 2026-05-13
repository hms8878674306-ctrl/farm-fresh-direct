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
  heroCopy:
    "Real food. Real farmers. Zero middlemen. Order today, get it tomorrow - pay cash on delivery.",
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
  verified: "Verified",
  farmerHeroTitle: "Good day, farmer. Your market desk is ready.",
  farmerHeroCopy:
    "Add today's produce, watch buyer demand, respond to offers, and keep your order work moving from one place.",
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
  tutorial3Body: "Press the microphone and say: tomato price 45 stock 20.",
  tutorial4Title: "Call support",
  tutorial4Body: "For demo help, call the toll-free number shown on the website.",
  tollFree: "Demo toll-free help: 1800-123-4567",
  voiceBot: "Voice listing bot",
  voiceBotHint: "Say crop, price, and stock. Example: tomato price 45 stock 20.",
  voiceStart: "Start voice",
  voiceStop: "Stop voice",
  voiceTranscript: "Heard",
  voiceUnsupported: "Voice input needs Chrome or Edge browser.",
  voiceNoPrice: "I could not find a price. Please say crop, price, and stock.",
  voiceParsed: "Voice details filled. Review and publish.",
  farmerDashboardTitle: "Farmer Dashboard",
  farmerDashboardCopy: "Manage your farm products and orders.",
  productListings: "Product Listings",
  addProduct: "Add Product",
  closeForm: "Close Form",
  productName: "Product name",
  price: "Price",
  stock: "Stock",
  imageUrl: "Image URL",
  saveProduct: "Save Product",
  adding: "Adding...",
  myProducts: "My Products",
  fillAllFields: "Fill all fields",
  failedAddProduct: "Failed to add product",
  thisWeek: "This week",
  pendingOrders: "Pending orders",
  topProduct: "Top product",
  followers: "Followers",
};

const hi: Dictionary = {
  ...en,
  home: "\u0939\u094b\u092e",
  shop: "\u092c\u093e\u091c\u093c\u093e\u0930",
  farmers: "\u0915\u093f\u0938\u093e\u0928",
  track: "\u091f\u094d\u0930\u0948\u0915",
  dashboard: "\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
  farmerDashboard: "\u092c\u093f\u0915\u094d\u0930\u0940",
  listings: "\u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917",
  orders: "\u0911\u0930\u094d\u0921\u0930",
  chat: "\u091a\u0948\u091f",
  signIn: "\u0932\u0949\u0917 \u0907\u0928",
  signOut: "\u0932\u0949\u0917 \u0906\u0909\u091f",
  cart: "\u0915\u093e\u0930\u094d\u091f",
  language: "\u092d\u093e\u0937\u093e",
  addToCart:
    "\u0915\u093e\u0930\u094d\u091f \u092e\u0947\u0902 \u091c\u094b\u0921\u093c\u0947\u0902",
  addedToCart: "\u0915\u093e\u0930\u094d\u091f \u092e\u0947\u0902 \u091c\u0941\u0921\u093c\u093e",
  total: "\u0915\u0941\u0932",
  per: "\u092a\u094d\u0930\u0924\u093f",
  farmerMode:
    "\u0915\u093f\u0938\u093e\u0928 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0937\u0947\u0924\u094d\u0930",
  consumerMode: "\u0917\u094d\u0930\u093e\u0939\u0915 \u092c\u093e\u091c\u093c\u093e\u0930",
  heroEyebrow: "\u092e\u094c\u0938\u092e\u0940 \u091a\u0941\u0928\u093e\u0935",
  heroTitleA: "\u0924\u093e\u091c\u093c\u0917\u0940 \u0938\u0940\u0927\u0947",
  heroTitleB: "\u0916\u0947\u0924 \u0938\u0947.",
  heroCopy:
    "\u0905\u0938\u0932\u0940 \u0916\u093e\u0928\u093e, \u0905\u0938\u0932\u0940 \u0915\u093f\u0938\u093e\u0928, \u0915\u094b\u0908 \u092c\u093f\u091a\u094c\u0932\u093f\u092f\u093e \u0928\u0939\u0940\u0902. \u0906\u091c \u0911\u0930\u094d\u0921\u0930 \u0915\u0930\u0947\u0902, \u0915\u0932 \u092a\u093e\u090f\u0902 - \u0915\u0948\u0936 \u0911\u0928 \u0921\u093f\u0932\u0940\u0935\u0930\u0940.",
  trustVerified: "\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0915\u093f\u0938\u093e\u0928",
  trustMiddleman:
    "\u0915\u094b\u0908 \u092c\u093f\u091a\u094c\u0932\u093f\u092f\u093e \u0928\u0939\u0940\u0902",
  trustPayment:
    "\u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u092d\u0941\u0917\u0924\u093e\u0928 + COD",
  trustDelivery: "\u0909\u0938\u0940 \u0926\u093f\u0928 \u0921\u093f\u0932\u0940\u0935\u0930\u0940",
  aiPicks: "\u0906\u092a\u0915\u0947 \u0932\u093f\u090f \u0938\u0941\u091d\u093e\u0935",
  inSeason:
    "\u0906\u092a\u0915\u0947 \u092a\u093e\u0938 \u092e\u094c\u0938\u092e\u0940 \u091a\u0940\u091c\u0947\u0902",
  inSeasonCopy:
    "\u092e\u094c\u0938\u092e, \u0906\u092a\u0915\u0947 \u0907\u0932\u093e\u0915\u0947 \u0914\u0930 \u0906\u091c \u0915\u0940 \u0924\u093e\u091c\u093c\u0917\u0940 \u0915\u0947 \u0906\u0927\u093e\u0930 \u092a\u0930.",
  viewAll: "\u0938\u092c \u0926\u0947\u0916\u0947\u0902",
  farmerStories:
    "\u0905\u0938\u0932\u0940 \u0932\u094b\u0917, \u0905\u0938\u0932\u0940 \u0916\u0947\u0924",
  meetFarmers:
    "\u0905\u092a\u0928\u0947 \u0915\u093f\u0938\u093e\u0928\u094b\u0902 \u0938\u0947 \u092e\u093f\u0932\u0947\u0902",
  specialty: "\u0935\u093f\u0936\u0947\u0937\u0924\u093e",
  verified: "\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924",
  farmerHeroTitle:
    "\u0928\u092e\u0938\u094d\u0924\u0947 \u0915\u093f\u0938\u093e\u0928. \u0906\u092a\u0915\u093e \u092c\u093e\u091c\u093c\u093e\u0930 \u0921\u0947\u0938\u094d\u0915 \u0924\u0948\u092f\u093e\u0930 \u0939\u0948.",
  farmerHeroCopy:
    "\u0906\u091c \u0915\u0940 \u092b\u0938\u0932 \u091c\u094b\u0921\u093c\u0947\u0902, \u0916\u0930\u0940\u0926\u093e\u0930 \u092e\u093e\u0902\u0917 \u0926\u0947\u0916\u0947\u0902, \u0911\u092b\u0930 \u0915\u093e \u091c\u0935\u093e\u092c \u0926\u0947\u0902 \u0914\u0930 \u0911\u0930\u094d\u0921\u0930 \u0938\u0902\u092d\u093e\u0932\u0947\u0902.",
  addListing:
    "\u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917 \u091c\u094b\u0921\u093c\u0947\u0902",
  buyerOffers: "\u0916\u0930\u0940\u0926\u093e\u0930 \u0911\u092b\u0930",
  quickListing:
    "\u0924\u094d\u0935\u0930\u093f\u0924 \u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917",
  addCropFast:
    "30 \u0938\u0947\u0915\u0902\u0921 \u092e\u0947\u0902 \u092b\u0938\u0932 \u091c\u094b\u0921\u093c\u0947\u0902",
  cropName:
    "\u092b\u0938\u0932 \u0915\u093e \u0928\u093e\u092e, \u091c\u0948\u0938\u0947 \u091f\u092e\u093e\u091f\u0930",
  pricePerKg: "\u0915\u0940\u092e\u0924 / \u0915\u093f\u0932\u094b",
  stockKg: "\u0938\u094d\u091f\u0949\u0915 \u0915\u093f\u0932\u094b",
  publishListing:
    "\u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0930\u0947\u0902",
  saving: "\u0938\u0947\u0935 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...",
  fullListingHint:
    "\u092a\u0942\u0930\u0940 \u092b\u094b\u091f\u094b \u0914\u0930 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0915\u0947 \u0932\u093f\u090f \u0938\u0947\u0935 \u0915\u0930\u0928\u0947 \u0915\u0947 \u092c\u093e\u0926 \u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917 \u092c\u091f\u0928 \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0947\u0902.",
  activeListings:
    "\u0938\u0915\u094d\u0930\u093f\u092f \u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917",
  buyerChats: "\u0916\u0930\u0940\u0926\u093e\u0930 \u091a\u0948\u091f",
  lowStock: "\u0915\u092e \u0938\u094d\u091f\u0949\u0915",
  listedValue: "\u0932\u093f\u0938\u094d\u091f\u0947\u0921 \u092e\u0942\u0932\u094d\u092f",
  today: "\u0906\u091c",
  workChecklist: "\u0915\u093e\u092e \u0915\u0940 \u0938\u0942\u091a\u0940",
  taskOffers:
    "\u0916\u0930\u0940\u0926\u093e\u0930 \u0911\u092b\u0930 \u0926\u0947\u0916\u0947\u0902",
  taskStock:
    "\u0906\u091c \u0915\u093e \u0938\u094d\u091f\u0949\u0915 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0947\u0902",
  taskPack:
    "\u092c\u093e\u0915\u0940 \u0911\u0930\u094d\u0921\u0930 \u092a\u0948\u0915 \u0915\u0930\u0947\u0902",
  taskPickup:
    "\u0921\u093f\u0932\u0940\u0935\u0930\u0940 \u092a\u093f\u0915\u0905\u092a \u091c\u093e\u0902\u091a\u0947\u0902",
  demand: "\u092e\u093e\u0902\u0917",
  marketSignals: "\u092c\u093e\u091c\u093c\u093e\u0930 \u0938\u0902\u0915\u0947\u0924",
  buyerInterestHigh:
    "\u0916\u0930\u0940\u0926\u093e\u0930 \u0930\u0941\u091a\u093f \u0905\u0927\u093f\u0915",
  buyerInterestRising:
    "\u0916\u0930\u0940\u0926\u093e\u0930 \u0930\u0941\u091a\u093f \u092c\u0922\u093c \u0930\u0939\u0940 \u0939\u0948",
  buyerInterestSteady:
    "\u0916\u0930\u0940\u0926\u093e\u0930 \u0930\u0941\u091a\u093f \u0938\u094d\u0925\u093f\u0930",
  manageListings:
    "\u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917 \u0938\u0902\u092d\u093e\u0932\u0947\u0902",
  manageListingsCopy:
    "\u092a\u0942\u0930\u0940 \u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917 \u0916\u094b\u0932\u0947\u0902, \u092b\u094b\u091f\u094b \u091c\u094b\u0921\u093c\u0947\u0902 \u0914\u0930 \u0938\u094d\u091f\u0949\u0915 \u0926\u0947\u0916\u0947\u0902.",
  prepareOrders:
    "\u0911\u0930\u094d\u0921\u0930 \u0924\u0948\u092f\u093e\u0930 \u0915\u0930\u0947\u0902",
  prepareOrdersCopy:
    "\u0926\u093f\u0928 \u0915\u0947 \u0911\u0930\u094d\u0921\u0930 \u0914\u0930 \u0921\u093f\u0932\u0940\u0935\u0930\u0940 \u0938\u094d\u0925\u093f\u0924\u093f \u0926\u0947\u0916\u0947\u0902.",
  negotiateOffers: "\u0911\u092b\u0930 \u092a\u0930 \u092c\u093e\u0924 \u0915\u0930\u0947\u0902",
  negotiateOffersCopy:
    "\u0916\u0930\u0940\u0926\u093e\u0930 \u091a\u0948\u091f \u0916\u094b\u0932\u0947\u0902 \u0914\u0930 \u0915\u093f\u0938\u093e\u0928 \u0915\u0940 \u0924\u0930\u092b \u0938\u0947 \u091c\u0935\u093e\u092c \u0926\u0947\u0902.",
  tutorialTitle:
    "\u0935\u0947\u092c\u0938\u093e\u0907\u091f \u0915\u0948\u0938\u0947 \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0947\u0902",
  tutorialSubtitle:
    "\u0915\u093f\u0938\u093e\u0928\u094b\u0902 \u0914\u0930 \u0928\u090f \u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e\u0913\u0902 \u0915\u0947 \u0932\u093f\u090f \u0906\u0938\u093e\u0928 \u0915\u0926\u092e.",
  tutorial1Title:
    "\u0905\u092a\u0928\u0940 \u092b\u0938\u0932 \u091c\u094b\u0921\u093c\u0947\u0902",
  tutorial1Body:
    "\u092b\u0938\u0932 \u0915\u093e \u0928\u093e\u092e, \u0915\u0940\u092e\u0924 \u0914\u0930 \u0938\u094d\u091f\u0949\u0915 \u0921\u093e\u0932\u0947\u0902. \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0930\u0947\u0902 \u0926\u092c\u093e\u090f\u0902.",
  tutorial2Title:
    "\u0916\u0930\u0940\u0926\u093e\u0930 \u0911\u092b\u0930 \u0926\u0947\u0916\u0947\u0902",
  tutorial2Body:
    "\u091a\u0948\u091f \u0916\u094b\u0932\u0947\u0902 \u0914\u0930 \u0916\u0930\u0940\u0926\u093e\u0930 \u0938\u0947 \u092e\u094b\u0932\u092d\u093e\u0935 \u0915\u0930\u0947\u0902.",
  tutorial3Title:
    "\u0906\u0935\u093e\u091c\u093c \u0938\u0939\u093e\u092f\u0924\u093e \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0947\u0902",
  tutorial3Body:
    "\u092e\u093e\u0907\u0915 \u0926\u092c\u093e\u090f\u0902 \u0914\u0930 \u092c\u094b\u0932\u0947\u0902: \u091f\u092e\u093e\u091f\u0930 \u0915\u0940\u092e\u0924 45 \u0938\u094d\u091f\u0949\u0915 20.",
  tutorial4Title:
    "\u0938\u0939\u093e\u092f\u0924\u093e \u092a\u0930 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902",
  tutorial4Body:
    "\u0921\u0947\u092e\u094b \u0938\u0939\u093e\u092f\u0924\u093e \u0915\u0947 \u0932\u093f\u090f \u0935\u0947\u092c\u0938\u093e\u0907\u091f \u092a\u0930 \u0926\u093f\u092f\u093e \u091f\u094b\u0932-\u092b\u094d\u0930\u0940 \u0928\u0902\u092c\u0930 \u0926\u0947\u0916\u0947\u0902.",
  tollFree:
    "\u0921\u0947\u092e\u094b \u091f\u094b\u0932-\u092b\u094d\u0930\u0940 \u0939\u0947\u0932\u094d\u092a: 1800-123-4567",
  voiceBot:
    "\u0906\u0935\u093e\u091c\u093c \u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917 \u092c\u0949\u091f",
  voiceBotHint:
    "\u092b\u0938\u0932, \u0915\u0940\u092e\u0924 \u0914\u0930 \u0938\u094d\u091f\u0949\u0915 \u092c\u094b\u0932\u0947\u0902. \u091c\u0948\u0938\u0947: \u091f\u092e\u093e\u091f\u0930 \u0915\u0940\u092e\u0924 45 \u0938\u094d\u091f\u0949\u0915 20.",
  voiceStart: "\u0906\u0935\u093e\u091c\u093c \u0936\u0941\u0930\u0942",
  voiceStop: "\u0906\u0935\u093e\u091c\u093c \u0930\u094b\u0915\u0947\u0902",
  voiceTranscript: "\u0938\u0941\u0928\u093e",
  voiceNoPrice:
    "\u0915\u0940\u092e\u0924 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940. \u0915\u0943\u092a\u092f\u093e \u092b\u0938\u0932, \u0915\u0940\u092e\u0924 \u0914\u0930 \u0938\u094d\u091f\u0949\u0915 \u092c\u094b\u0932\u0947\u0902.",
  voiceParsed:
    "\u0906\u0935\u093e\u091c\u093c \u0938\u0947 \u0935\u093f\u0935\u0930\u0923 \u092d\u0930 \u0926\u093f\u092f\u093e. \u091c\u093e\u0902\u091a\u0947\u0902 \u0914\u0930 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0930\u0947\u0902.",
  farmerDashboardTitle:
    "\u0915\u093f\u0938\u093e\u0928 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
  farmerDashboardCopy:
    "\u0905\u092a\u0928\u0947 \u0916\u0947\u0924 \u0915\u0947 \u0909\u0924\u094d\u092a\u093e\u0926 \u0914\u0930 \u0911\u0930\u094d\u0921\u0930 \u0938\u0902\u092d\u093e\u0932\u0947\u0902.",
  productListings:
    "\u0909\u0924\u094d\u092a\u093e\u0926 \u0932\u093f\u0938\u094d\u091f\u093f\u0902\u0917",
  addProduct: "\u0909\u0924\u094d\u092a\u093e\u0926 \u091c\u094b\u0921\u093c\u0947\u0902",
  closeForm: "\u092b\u0949\u0930\u094d\u092e \u092c\u0902\u0926",
  productName: "\u0909\u0924\u094d\u092a\u093e\u0926 \u0915\u093e \u0928\u093e\u092e",
  price: "\u0915\u0940\u092e\u0924",
  stock: "\u0938\u094d\u091f\u0949\u0915",
  imageUrl: "\u0907\u092e\u0947\u091c URL",
  saveProduct: "\u0909\u0924\u094d\u092a\u093e\u0926 \u0938\u0947\u0935",
  adding: "\u091c\u094b\u0921\u093c \u0930\u0939\u093e \u0939\u0948...",
  myProducts: "\u092e\u0947\u0930\u0947 \u0909\u0924\u094d\u092a\u093e\u0926",
  fillAllFields: "\u0938\u092d\u0940 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u0947\u0902",
  failedAddProduct:
    "\u0909\u0924\u094d\u092a\u093e\u0926 \u091c\u094b\u0921\u093c\u0928\u093e \u0935\u093f\u092b\u0932",
  thisWeek: "\u0907\u0938 \u0939\u092b\u094d\u0924\u0947",
  pendingOrders: "\u092c\u093e\u0915\u0940 \u0911\u0930\u094d\u0921\u0930",
  topProduct: "\u0936\u0940\u0930\u094d\u0937 \u0909\u0924\u094d\u092a\u093e\u0926",
  followers: "\u092b\u0949\u0932\u094b\u0905\u0930",
};

const mr: Dictionary = {
  ...hi,
  farmers: "\u0936\u0947\u0924\u0915\u0930\u0940",
  farmerDashboard: "\u0935\u093f\u0915\u094d\u0930\u0940",
  farmerMode:
    "\u0936\u0947\u0924\u0915\u0930\u0940 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0937\u0947\u0924\u094d\u0930",
  heroEyebrow: "\u0939\u0902\u0917\u093e\u092e\u0940 \u0928\u093f\u0935\u0921",
  heroTitleA: "\u0924\u093e\u091c\u0947\u092a\u0923\u093e \u0925\u0947\u091f",
  heroTitleB: "\u0936\u0947\u0924\u093e\u0924\u0942\u0928.",
  heroCopy:
    "\u0916\u0930\u0947 \u0905\u0928\u094d\u0928, \u0916\u0930\u0947 \u0936\u0947\u0924\u0915\u0930\u0940, \u092e\u0927\u094d\u092f\u0938\u094d\u0925 \u0928\u093e\u0939\u0940. \u0906\u091c \u0911\u0930\u094d\u0921\u0930 \u0915\u0930\u093e, \u0909\u0926\u094d\u092f\u093e \u092e\u093f\u0933\u0935\u093e - \u0915\u0945\u0936 \u0911\u0928 \u0921\u093f\u0932\u093f\u0935\u094d\u0939\u0930\u0940.",
  meetFarmers:
    "\u0906\u092a\u0932\u094d\u092f\u093e \u0936\u0947\u0924\u0915\u0930\u094d\u092f\u093e\u0902\u0928\u093e \u092d\u0947\u091f\u093e",
  farmerHeroTitle:
    "\u0928\u092e\u0938\u094d\u0915\u093e\u0930 \u0936\u0947\u0924\u0915\u0930\u0940. \u0924\u0941\u092e\u091a\u093e \u092c\u093e\u091c\u093e\u0930 \u0921\u0947\u0938\u094d\u0915 \u0924\u092f\u093e\u0930 \u0906\u0939\u0947.",
  farmerHeroCopy:
    "\u0906\u091c\u091a\u093e \u092e\u093e\u0932 \u091c\u094b\u0921\u093e, \u0916\u0930\u0947\u0926\u0940\u0926\u093e\u0930\u093e\u0902\u091a\u0940 \u092e\u093e\u0917\u0923\u0940 \u092a\u093e\u0939\u093e, \u0911\u092b\u0930\u0932\u093e \u0909\u0924\u094d\u0924\u0930 \u0926\u094d\u092f\u093e \u0906\u0923\u093f \u0911\u0930\u094d\u0921\u0930 \u0938\u093e\u0902\u092d\u093e\u0933\u093e.",
  addListing: "\u092f\u093e\u0926\u0940 \u091c\u094b\u0921\u093e",
  quickListing: "\u091c\u0932\u0926 \u092f\u093e\u0926\u0940",
  addCropFast:
    "30 \u0938\u0947\u0915\u0902\u0926\u093e\u0924 \u092a\u0940\u0915 \u091c\u094b\u0921\u093e",
  cropName:
    "\u092a\u0940\u0915 \u0928\u093e\u0935, \u0909\u0926\u093e. \u091f\u094b\u092e\u0945\u091f\u094b",
  publishListing:
    "\u092f\u093e\u0926\u0940 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0930\u093e",
  voiceBot: "\u0906\u0935\u093e\u091c \u092f\u093e\u0926\u0940 \u092c\u0949\u091f",
  voiceBotHint:
    "\u092a\u0940\u0915, \u0915\u093f\u0902\u092e\u0924 \u0906\u0923\u093f \u0938\u094d\u091f\u0949\u0915 \u092c\u094b\u0932\u093e. \u091c\u0938\u0947: \u091f\u094b\u092e\u0945\u091f\u094b \u0915\u093f\u0902\u092e\u0924 45 \u0938\u094d\u091f\u0949\u0915 20.",
  voiceStart: "\u0906\u0935\u093e\u091c \u0936\u0941\u0930\u0942",
  voiceStop: "\u0906\u0935\u093e\u091c \u0925\u093e\u0902\u092c\u0935\u093e",
  voiceTranscript: "\u0910\u0915\u0932\u0947",
  farmerDashboardTitle:
    "\u0936\u0947\u0924\u0915\u0930\u0940 \u0921\u0945\u0936\u092c\u094b\u0930\u094d\u0921",
  farmerDashboardCopy:
    "\u0924\u0941\u092e\u091a\u0947 \u0936\u0947\u0924\u092e\u093e\u0932 \u0906\u0923\u093f \u0911\u0930\u094d\u0921\u0930 \u0938\u093e\u0902\u092d\u093e\u0933\u093e.",
  productListings: "\u0909\u0924\u094d\u092a\u093e\u0926 \u092f\u093e\u0926\u0940",
  addProduct: "\u0909\u0924\u094d\u092a\u093e\u0926 \u091c\u094b\u0921\u093e",
  closeForm: "\u092b\u0949\u0930\u094d\u092e \u092c\u0902\u0926",
  saveProduct: "\u0909\u0924\u094d\u092a\u093e\u0926 \u0938\u0947\u0935\u094d\u0939",
  myProducts: "\u092e\u093e\u091d\u0947 \u0909\u0924\u094d\u092a\u093e\u0926",
  tollFree:
    "\u0921\u0947\u092e\u094b \u091f\u094b\u0932-\u092b\u094d\u0930\u0940 \u092e\u0926\u0924: 1800-123-4567",
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
    [language],
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}

export const useLanguage = () => useContext(LanguageCtx);
