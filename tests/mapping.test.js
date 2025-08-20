import { enToHe, heToEn, fixLayout } from "../src/mapping.js";  


console.log("Test 1: enToHe('abc') =", enToHe("abc"));
console.log("Test 2: heToEn('אבג') =", heToEn("אבג"));
console.log("Test 3: fixLayout(\"t,ho\") =", fixLayout("t,ho")); // אמור לצאת שלום
console.log("Test 4: heToEn(''ישא') =", heToEn("'ישא"));
