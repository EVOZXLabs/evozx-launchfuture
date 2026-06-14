import { symbolExists } from "./factory.js";

export async function checkSymbol(symbol) {
  const s = symbol?.trim();
  
  if (!s) {
    return { valid: false, message: "Symbol cannot be empty" };
  }

  try {
    const exists = await symbolExists(s);
    return exists 
      ? { valid: false, message: "Symbol already exists" }
      : { valid: true, message: "Symbol available" };
  } catch (error) {
    console.error("Symbol check error:", error);
    return { valid: false, message: "Error checking symbol" };
  }
}
