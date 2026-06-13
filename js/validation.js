import { symbolExists } from "./factory.js";

export async function checkSymbol(symbol) {

  if (!symbol || symbol.trim() === "") {
    return {
      valid: false,
      message: "Symbol cannot be empty"
    };
  }

  try {

    const exists =
      await symbolExists(symbol);

    if (exists) {
      return {
        valid: false,
        message: "Symbol already exists"
      };
    }

    return {
      valid: true,
      message: "Symbol available"
    };

  } catch (error) {

    console.error(error);

    return {
      valid: false,
      message: "Error checking symbol"
    };
  }
}
