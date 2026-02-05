import BASE_URL from "./config";

export const predictAdherence = async (inputData) => {
  try {
    const response = await fetch(`${BASE_URL}/predict/adherence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    if (!response.ok) {
      throw new Error("Adherence prediction failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Adherence API Error:", error);
    throw error;
  }
};