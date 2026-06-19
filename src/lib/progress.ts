const PREFIX = "wdsjl-discovered";

function storageKey(slug: string) {
  return `${PREFIX}:${slug}`;
}

export function getDiscoveredIds(slug: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markDiscovered(slug: string, itemId: string): string[] {
  const current = getDiscoveredIds(slug);
  if (current.includes(itemId)) return current;

  const next = [...current, itemId];
  localStorage.setItem(storageKey(slug), JSON.stringify(next));
  return next;
}
