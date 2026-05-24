import fs from "fs";

const s = fs.readFileSync("src/lib/i18n/en.ts", "utf8");
const start = s.indexOf("export const en: Dictionary = {");
const end = s.indexOf("\n};", start) + 3;
if (start === -1 || end === 2) throw new Error("en block not found");

const body = s.slice(start + "export const en: Dictionary = ".length, end);
const extraEntries = [
  { key: "featureAiTitle", value: "AI price prediction" },
  { key: "featureAiCopy", value: "Use machine learning to forecast crop prices and help farmers make smarter selling decisions." },
  { key: "featureVoiceTitle", value: "Regional voice support" },
  { key: "featureVoiceCopy", value: "Enable voice navigation in local languages to make the platform more accessible for every user." },
  { key: "featureGpsTitle", value: "GPS delivery tracking" },
  { key: "featureGpsCopy", value: "Let customers monitor deliveries in real time with accurate location updates and arrival estimates." },
];

const missingEntries = extraEntries.filter(({ key }) => !body.includes(`${key}:`));
const extra = missingEntries.length > 0
  ? "\n" + missingEntries.map(({ key, value }) => `  ${key}: "${value}",`).join("\n") + "\n"
  : "";

const merged = extra ? body.replace(/\n\};$/, `${extra}\n};`) : body;
fs.mkdirSync("src/lib/i18n", { recursive: true });
fs.writeFileSync(
  "src/lib/i18n/en.ts",
  `export type Dictionary = Record<string, string>;\n\nexport const en: Dictionary = ${merged}\n`,
);
