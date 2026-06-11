
import { GoogleGenAI } from "@google/genai";
import { VisualizationStep, OperationType, ConceptType } from '../types';

let ai: GoogleGenAI | null = null;
try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
// FIX: Added curly braces to the catch block to correct the syntax.
} catch (error) {
    console.error("Failed to initialize GoogleGenAI. Make sure API_KEY is set.", error);
}

export interface GeminiExplanation {
    explanation: string;
    sources: { web: { uri: string; title: string } }[];
}

export const getExplanationForStep = async (concept: ConceptType, operation: OperationType, step: VisualizationStep, contextData: string): Promise<GeminiExplanation> => {
  if (!ai) {
    return { explanation: "Gemini API not initialized. Please configure your API key.", sources: [] };
  }
  if (!process.env.API_KEY) {
      return { explanation: "API key is not configured. Please set the API_KEY environment variable.", sources: [] };
  }

  const prompt = `
    You are a friendly and helpful computer science professor explaining an algorithm to a student.
    Your explanation should be simple, concise, and easy to understand for a beginner.
    Do not use complex jargon. Explain in 1-2 short sentences. You can use Google Search to find more information if needed.

    Current Concept: ${concept.toUpperCase()}
    Current Operation: ${operation.toUpperCase()}
    Current Data State (simplified): ${contextData}
    Current Step Description: "${step.message}"

    Based on this information, explain *why* this specific step is being taken in the context of the ${operation} algorithm.
    For example, if the concept is 'sorting' and the step is "Comparing 5 and 3. Swapping them.", a good explanation would be: "In Bubble Sort, we compare adjacent elements. Since 5 is greater than 3 and we want to move larger elements to the end, we swap them."
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
          tools: [{googleSearch: {}}]
        }
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web) || [];

    return {
        explanation: response.text,
        sources: sources as { web: { uri: string; title: string; } }[]
    };

  } catch (error) {
    console.error("Error fetching explanation from Gemini:", error);
    return { explanation: "Sorry, I couldn't fetch an explanation at the moment.", sources: [] };
  }
};
