// src/api/diabetesApi.js

import BASE_URL from "./config";

export const predictDiabetes = async (inputData) => {
  try {
    const response = await fetch(`${BASE_URL}/predict/diabetes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    if (!response.ok) {
      throw new Error("Diabetes prediction failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Diabetes API Error:", error);
    throw error;
  }
};
