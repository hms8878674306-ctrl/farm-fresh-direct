/** Selectors used by Lovable preview / lovable-tagger for the "Edit with Lovable" chip. */
const LOVABLE_BADGE_SELECTORS = [
  "#lovable-badge",
  "[data-lovable-badge]",
  ".lovable-badge",
  'a[href*="lovable.dev"][id*="badge"]',
  'div[id*="lovable"][class*="badge"]',
];

function removeLovableBadgeNodes() {
  for (const selector of LOVABLE_BADGE_SELECTORS) {
    document.querySelectorAll(selector).forEach((node) => node.remove());
  }

  document.querySelectorAll("a, button, div").forEach((node) => {
    const text = node.textContent?.trim().toLowerCase() ?? "";
    if (!text.includes("edit with") || !text.includes("lovable")) return;
    const el = node as HTMLElement;
    if (getComputedStyle(el).position === "fixed") el.remove();
  });
}

/** Hide/remove Lovable branding injected at runtime (dev preview & hosted sandbox). */
export function hideLovableBadge(): () => void {
  if (typeof document === "undefined") return () => {};

  removeLovableBadgeNodes();

  const observer = new MutationObserver(() => removeLovableBadgeNodes());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  return () => observer.disconnect();
}
