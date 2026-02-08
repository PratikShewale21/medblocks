import BASE_URL from "./config";

/**
 * Sends patient data to the backend to generate an AI summary.
 * Used in SecureVault.jsx
 */
export const generateSummary = async (inputData) => {
  try {
    const response = await fetch(`${BASE_URL}/predict/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    if (!response.ok) {
      throw new Error("Summary generation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Summary API Error:", error);
    throw error;
  }
};