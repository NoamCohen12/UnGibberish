// UnGibberish — modern ESM mapping (Hebrew ↔ English, QWERTY)

// ------------------------------
// 1) Base dictionaries
// ASCII only (no smart quotes / no geresh U+05F3 in the map itself)
export const enToHeMap = {
  "q": "/", "w": "'", "e": "ק", "r": "ר", "t": "א", "y": "ט", "u": "ו", "i": "ן", "o": "ם", "p": "פ",
  "a": "ש", "s": "ד", "d": "ג", "f": "כ", "g": "ע", "h": "י", "j": "ח", "k": "ל", "l": "ך",
  ";": "ף", "'": ",",
  "z": "ז", "x": "ס", "c": "ב", "v": "ה", "b": "נ", "n": "מ", "m": "צ", ",": "ת", ".": "ץ", "/": ".",

  "Q": "?", "W": "\"", "E": "ק", "R": "ר", "T": "א", "Y": "ט", "U": "ו", "I": "ן", "O": "ם", "P": "פ",
  "A": "ש", "S": "ד", "D": "ג", "F": "כ", "G": "ע", "H": "י", "J": "ח", "K": "ל", "L": "ך",
  ":": "ף", "\"": ",",
  "Z": "ז", "X": "ס", "C": "ב", "V": "ה", "B": "נ", "N": "מ", "M": "צ", "<": "ת", ">": "ץ", "?": "."
};

// Build reverse map (Hebrew → English)
export const heToEnMap = {};
for (const [en, he] of Object.entries(enToHeMap)) {
  if (!heToEnMap[he]) heToEnMap[he] = en;
}

// Add overrides for common non-ASCII punctuation that users paste/type
// Hebrew geresh/gershayim & smart quotes → map to ASCII equivalents
heToEnMap["׳"] = "w";  // U+05F3 Hebrew Geresh → same as ASCII '
heToEnMap["״"] = "W";  // U+05F4 Hebrew Gershayim → same as ASCII "
heToEnMap["’"] = "w";  // U+2019 right single smart quote
heToEnMap["‘"] = "w";  // U+2018 left single smart quote
heToEnMap["”"] = "W";  // U+201D right double smart quote
heToEnMap["“"] = "W";  // U+201C left double smart quote

// ------------------------------
// 2) Helpers

// Normalize “smart” quotes and Hebrew geresh/gershayim to ASCII before mapping
export function normalizePunct(str) {
  return str
    .replace(/\u05F3/g, "'")      // ׳  → '
    .replace(/\u05F4/g, '"')      // ״  → "
    .replace(/[\u2018\u2019]/g, "'") // ‘ ’ → '
    .replace(/[\u201C\u201D]/g, '"'); // “ ” → "
}

export function detectDominantScript(text) {
  let he = 0, en = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 0x0590 && c <= 0x05FF) he++;
    else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) en++;
  }
  if (he > en) return "he";
  if (en > he) return "en";
  return "unknown";
}

export function mapByDict(text, dict) {
  const t = normalizePunct(text);
  let out = "";
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    out += dict[ch] ?? ch;
  }
  return out;
}

// ------------------------------
// 3) Public API

export function enToHe(text) {
  return mapByDict(text, enToHeMap);
}

export function heToEn(text) {
  return mapByDict(text, heToEnMap);
}

// Auto direction:
// - If looks Hebrew → convert to English
// - If looks English → convert to Hebrew
// - Unknown → try both and pick the one that "looks" more like a real script
export function fixLayout(text) {
  const dom = detectDominantScript(text);
  if (dom === "he") return heToEn(text);
  if (dom === "en") return enToHe(text);

  const toHe = enToHe(text);
  const toEn = heToEn(text);
  const domHe = detectDominantScript(toHe);
  const domEn = detectDominantScript(toEn);

  if (domHe === "he" && domEn !== "en") return toHe;
  if (domEn === "en" && domHe !== "he") return toEn;
  return toHe; // fallback
}

// ------------------------------
// 4) Attach to window for the extension content script
if (typeof window !== "undefined") {
  window.UnGibberish = {
    enToHeMap,
    heToEnMap,
    normalizePunct,
    detectDominantScript,
    mapByDict,
    enToHe,
    heToEn,
    fixLayout
  };
}
