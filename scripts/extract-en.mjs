import fs from "fs";

const s = fs.readFileSync("src/lib/language-context.tsx", "utf8");
const start = s.indexOf("const en: Dictionary = {");
const end = s.indexOf("\n};", start) + 3;
if (start === -1 || end === 2) throw new Error("en block not found");

const body = s.slice(start + "const en: Dictionary = ".length, end);
const extra = `
  featureAiTitle: "AI price prediction",
  featureAiCopy: "Use machine learning to forecast crop prices and help farmers make smarter selling decisions.",
  featureVoiceTitle: "Regional voice support",
  featureVoiceCopy: "Enable voice navigation in local languages to make the platform more accessible for every user.",
  featureGpsTitle: "GPS delivery tracking",
  featureGpsCopy: "Let customers monitor deliveries in real time with accurate location updates and arrival estimates.",
`;

const merged = body.replace(/\n\};$/, `${extra}\n};`);
fs.mkdirSync("src/lib/i18n", { recursive: true });
fs.writeFileSync(
  "src/lib/i18n/en.ts",
  `export type Dictionary = Record<string, string>;\n\nexport const en: Dictionary = ${merged}\n`,
);
