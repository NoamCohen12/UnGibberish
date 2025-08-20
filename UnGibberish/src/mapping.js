// Bidirectional mapping between Hebrew and English keyboard layouts (QWERTY)

export const enToHe = {
  "q": "/", "w": "'", "e": "ק", "r": "ר", "t": "א", "y": "ט", "u": "ו", "i": "ן", "o": "ם", "p": "פ",
  "a": "ש", "s": "ד", "d": "ג", "f": "כ", "g": "ע", "h": "י", "j": "ח", "k": "ל", "l": "ך",
  ";": "ף", "'": ",",
  "z": "ז", "x": "ס", "c": "ב", "v": "ה", "b": "נ", "n": "מ", "m": "צ", ",": "ת", ".": "ץ", "/": ".",
  "Q": "?", "W": "\"", "E": "ק", "R": "ר", "T": "א", "Y": "ט", "U": "ו", "I": "ן", "O": "ם", "P": "פ",
  "A": "ש", "S": "ד", "D": "ג", "F": "כ", "G": "ע", "H": "י", "J": "ח", "K": "ל", "L": "ך",
  ":": "ף", "\"": ",",
  "Z": "ז", "X": "ס", "C": "ב", "V": "ה", "B": "נ", "N": "מ", "M": "צ", "<": "ת", ">": "ץ", "?": "."
};

// נבנה מיפוי הפוך
export const heToEn = {};
for (const [en, he] of Object.entries(enToHe)) {
  if (!heToEn[he]) heToEn[he] = en;
}

// נרמול גרשיים “חכמים” וגרש/גרשיים עבריים
export function normalizePunct(str) {
  return str
    .replace(/\u05F3/g, "'")   // ׳ → '
    .replace(/\u05F4/g, '"')   // ״ → "
    .replace(/[\u2018\u2019]/g, "'") // ‘ ’ → '
    .replace(/[\u201C\u201D]/g, '"'); // “ ” → "
}

export function detectDominantScript(text) {
  let heb = 0, lat = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 0x0590 && c <= 0x05FF) heb++;
    else if ((c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A)) lat++;
  }
  if (heb > lat) return "he";
  if (lat > heb) return "en";
  return "unknown";
}

export function mapTextByDictionary(text, dict) {
  const t = normalizePunct(text);
  let out = "";
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    out += dict[ch] ?? ch;
  }
  return out;
}

export function fixLayout(text) {
  const dominant = detectDominantScript(text);
  if (dominant === "he") return mapTextByDictionary(text, heToEn);
  if (dominant === "en") return mapTextByDictionary(text, enToHe);
  // לא ברור? ננסה את שני הכיוונים ונעדיף את זה שנראה "נכון"
  const toHe = mapTextByDictionary(text, enToHe);
  const toEn = mapTextByDictionary(text, heToEn);
  const domHe = detectDominantScript(toHe);
  const domEn = detectDominantScript(toEn);
  if (domHe === "he" && domEn !== "en") return toHe;
  if (domEn === "en" && domHe !== "he") return toEn;
  return toHe;
}

// חשיפה ל־window כדי שה־content script יוכל להשתמש: window.UnGibberish
if (typeof window !== "undefined") {
  window.UnGibberish = {
    enToHe, heToEn,
    normalizePunct, detectDominantScript, mapTextByDictionary, fixLayout
  };
}
