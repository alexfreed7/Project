export const STATUSES = [
  { id: "not_ready", label: "Not Ready", emoji: "\u{1F634}", color: "#e05252" },
  { id: "getting_ready", label: "Getting Ready", emoji: "\u{1F6BF}", color: "#e0a752" },
  { id: "almost_ready", label: "Almost Ready", emoji: "\u{1F457}", color: "#e0d652" },
  { id: "ready", label: "Ready to Go!", emoji: "✅", color: "#4caf6b" },
];

export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

export function slugifyRoomId(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function randomRoomId() {
  const words = ["tacos", "sushi", "brunch", "vibes", "squad", "night", "crew", "party"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${word}-${num}`;
}
