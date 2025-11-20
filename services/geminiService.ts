import { GoogleGenAI, Type } from "@google/genai";

// Access API key from environment
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getHintFromAI = async (numbers: number[]): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      The game is "24". I have the numbers: ${numbers.join(', ')}.
      The goal is to use addition, subtraction, multiplication, and division to reach exactly 24.
      Provide a helpful, subtle hint without giving away the full answer immediately.
      If it's very difficult, explain the first step.
      Keep the response under 25 words.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
      }
    });

    return response.text || "Try combining the largest numbers first.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble analyzing this right now. Try standard math logic!";
  }
};

export const getSolutionFromAI = async (numbers: number[]): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Solve the "24" game for these numbers: ${numbers.join(', ')}.
      Return strictly the mathematical expression. Example: "(8 - 4) * (3 + 3)".
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    return response.text || "Could not find a solution.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to AI solver.";
  }
};
