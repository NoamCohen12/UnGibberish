// ESM import
import { enToHe, heToEn, fixLayout } from "../src/mapping.js";

function runTests() {
  console.log("=== Running UnGibberish tests ===");

  // מיפוי אנגלית→עברית
  console.log("enToHe['w'] =", enToHe["w"], " (expected \"'\")");
  console.log("enToHe['e'] =", enToHe["e"], " (expected \"ק\")");

  // מיפוי עברית→אנגלית
  console.log("heToEn['ק'] =", heToEn["ק"], " (expected \"e\")");
  console.log("heToEn[\"'\"] =", heToEn["'"], " (expected \"w\")");

  // בדיקות תיקון טקסט
  console.log("fixLayout('םדמ') =", fixLayout("םדמ"), " (expected \"cmd\")");
  console.log("fixLayout('דיט םשתנא') =", fixLayout("דיט םשתנא"), " (expected \"git status\")");

  // גרשיים מיוחדים
  console.log("fixLayout('׳') =", fixLayout("׳"), " (expected \"w\")"); // Hebrew geresh
  console.log("fixLayout('’') =", fixLayout("’"), " (expected \"w\")"); // smart quote
  console.log("fixLayout('״') =", fixLayout("״"), " (expected \"W\")");
  console.log("fixLayout('“') =", fixLayout("“"), " (expected \"W\")");

  console.log("=== Done ===");
}

runTests();
