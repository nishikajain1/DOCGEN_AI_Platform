import { GoogleGenAI, Type } from "@google/genai";
import { DocType } from "../types";

// NOTE: In a production environment, API calls should go through a backend proxy
// to keep the API key secure. For this demo, we use it client-side.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_FAST = "gemini-2.5-flash";
const MODEL_REASONING = "gemini-2.5-flash"; // Using flash for speed in demo, swap to gemini-3-pro-preview for complex tasks

export const generateOutline = async (topic: string, type: DocType): Promise<string[]> => {
  const isSlide = type === DocType.PPTX;
  const prompt = `
    You are an expert document outliner. 
    Create a structured outline for a ${isSlide ? 'PowerPoint presentation' : 'Word document'} on the topic: "${topic}".
    
    ${isSlide ? 'Return a list of slide titles.' : 'Return a list of section headers.'}
    Ensure the outline is logical, comprehensive, and suitable for a professional business context.
    Limit to 5-8 main items.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as string[];
  } catch (error) {
    console.error("Gemini Outline Error:", error);
    return ["Introduction", "Market Overview", "Key Challenges", "Strategic Recommendations", "Conclusion"];
  }
};

export const generateSectionContent = async (
  topic: string, 
  sectionTitle: string, 
  type: DocType,
  contextOutline: string[]
): Promise<string> => {
  const isSlide = type === DocType.PPTX;
  
  const prompt = `
    You are writing a ${isSlide ? 'slide' : 'section'} for a document about "${topic}".
    
    Current Section/Slide Title: "${sectionTitle}"
    
    Context (Document Structure):
    ${contextOutline.join(', ')}
    
    Instructions:
    - Write professional business content for this specific section.
    - ${isSlide ? 'Format as bullet points suitable for a slide. Keep it concise.' : 'Write in clear paragraphs. Use formatting like bolding where appropriate.'}
    - Do not include the title in the output, just the content.
    - Keep it focused on the specific header.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Content Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const refineContent = async (
  currentContent: string, 
  instruction: string,
  type: DocType
): Promise<string> => {
  const prompt = `
    You are an expert editor. Refine the following text based on the user's instruction.
    
    Original Text:
    "${currentContent}"
    
    User Instruction:
    "${instruction}"
    
    Constraint:
    - Keep the format appropriate for a ${type === DocType.PPTX ? 'PowerPoint slide' : 'Word document'}.
    - Only return the refined text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text || currentContent;
  } catch (error) {
    console.error("Gemini Refinement Error:", error);
    return currentContent;
  }
};
