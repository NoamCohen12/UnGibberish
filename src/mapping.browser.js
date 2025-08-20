// UnGibberish — browser build (no exports, attaches to window)

(function () {
    const enToHeMap = {
      "q": "/", "w": "'", "e": "ק", "r": "ר", "t": "א", "y": "ט", "u": "ו", "i": "ן", "o": "ם", "p": "פ",
      "a": "ש", "s": "ד", "d": "ג", "f": "כ", "g": "ע", "h": "י", "j": "ח", "k": "ל", "l": "ך",
      ";": "ף", "'": ",",
      "z": "ז", "x": "ס", "c": "ב", "v": "ה", "b": "נ", "n": "מ", "m": "צ", ",": "ת", ".": "ץ", "/": ".",
      "Q": "/", "W": "'", "E": "ק", "R": "ר", "T": "א", "Y": "ט", "U": "ו", "I": "ן", "O": "ם", "P": "פ",
      "A": "ש", "S": "ד", "D": "ג", "F": "כ", "G": "ע", "H": "י", "J": "ח", "K": "ל", "L": "ך",
      ":": "ף", "\"": ",",     
      "Z": "ז", "X": "ס", "C": "ב", "V": "ה", "B": "נ", "N": "מ", "M": "צ", "<": "ת", ">": "ץ", "?": "?"
    };
    
  
    const heToEnMap = {};
    for (const [en, he] of Object.entries(enToHeMap)) {
      if (!heToEnMap[he]) heToEnMap[he] = en;
    }
    heToEnMap["׳"] = "w"; heToEnMap["’"] = "w"; heToEnMap["‘"] = "w";
    heToEnMap["״"] = "W"; heToEnMap["”"] = "W"; heToEnMap["“"] = "W";
  
    function normalizePunct(str) {
      return str
        .replace(/\u05F3/g, "'")      // ׳ → '
        .replace(/\u05F4/g, '"')      // ״ → "
        .replace(/[\u2018\u2019]/g, "'") // ‘ ’ → '
        .replace(/[\u201C\u201D]/g, '"'); // “ ” → "
    }
  
    function detectDominantScript(text) {
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
  
    function mapByDict(text, dict) {
      const t = normalizePunct(text);
      let out = "";
      for (let i = 0; i < t.length; i++) out += dict[t[i]] ?? t[i];
      return out;
    }
  
    function enToHe(text) { return mapByDict(text, enToHeMap); }
    function heToEn(text) { return mapByDict(text, heToEnMap); }
  
    function fixLayout(text) {
      const dom = detectDominantScript(text);
      if (dom === "he") return heToEn(text);
      if (dom === "en") return enToHe(text);
      const toHe = enToHe(text);
      const toEn = heToEn(text);
      const domHe = detectDominantScript(toHe);
      const domEn = detectDominantScript(toEn);
      if (domHe === "he" && domEn !== "en") return toHe;
      if (domEn === "en" && domHe !== "he") return toEn;
      return toHe;
    }
  
    window.UnGibberish = {
      enToHeMap, heToEnMap,
      normalizePunct, detectDominantScript, mapByDict,
      enToHe, heToEn, fixLayout
    };
  })();
  