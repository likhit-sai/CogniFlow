
import { GoogleGenAI, Type } from "@google/genai";
import { AiAction, Slide, PageItem, ItemType, OrganizationAction } from '../types';

const getAiClient = (() => {
  let ai: GoogleGenAI | null = null;
  return () => {
    if (!ai) {
      const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey });
    }
    return ai;
  };
})();

const getPromptForAction = (action: AiAction, text: string): string => {
    switch (action) {
        case 'summarize':
            return `Summarize the following text in a concise paragraph:\n\n---\n${text}`;
        case 'improve':
            return `Review the following text and improve its grammar, spelling, and clarity. Only output the improved text without any commentary:\n\n---\n${text}`;
        case 'brainstorm':
            return `Brainstorm and expand upon the following ideas. Provide a list of related concepts, potential next steps, and creative suggestions:\n\n---\n${text}`;
        default:
            throw new Error('Unknown AI action');
    }
}

export const generateAiText = async (action: AiAction, text: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = getPromptForAction(action, text);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              thinkingConfig: { thinkingBudget: 0 } 
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating AI text:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        }
        return "An unknown error occurred while contacting the AI service.";
    }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = getAiClient();
        
        const pureBase64 = audioBase64.split(',')[1];
        if (!pureBase64) {
            throw new Error("Invalid Base64 string for audio.");
        }

        const audioPart = {
            inlineData: {
                mimeType: mimeType,
                data: pureBase64,
            },
        };

        const textPart = {
            text: "Transcribe this audio recording of a meeting accurately."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        if (error instanceof Error) {
            throw new Error(`Transcription failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during transcription.");
    }
};

export const recognizeHandwriting = async (base64ImageData: string): Promise<string> => {
    try {
        const ai = getAiClient();
        
        const pureBase64 = base64ImageData.split(',')[1];
        if (!pureBase64) {
            throw new Error("Invalid Base64 string for image data.");
        }

        const imagePart = {
            inlineData: {
                mimeType: 'image/png', // Sketch is saved as PNG
                data: pureBase64,
            },
        };

        const textPart = {
            text: "Transcribe the handwritten text from this image accurately. If there is no text or the text is illegible, return an empty string."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error recognizing handwriting:", error);
        if (error instanceof Error) {
            throw new Error(`Handwriting recognition failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during handwriting recognition.");
    }
};

export const generatePresentation = async (topic: string): Promise<Slide[]> => {
    try {
        const ai = getAiClient();
        const prompt = `Generate a 5-slide presentation about "${topic}". For each slide, provide a concise title and content with 3-4 bullet points. Format the slide content as Markdown.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        slides: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: {
                                        type: Type.STRING,
                                        description: "The title of the slide."
                                    },
                                    content: {
                                        type: Type.STRING,
                                        description: "The content of the slide in Markdown format."
                                    }
                                },
                                required: ['title', 'content'],
                            }
                        }
                    },
                    required: ['slides'],
                }
            }
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        
        // Add unique IDs to each slide
        return result.slides.map((slide: Omit<Slide, 'id'>) => ({
            ...slide,
            id: `slide-${Date.now()}-${Math.random()}`
        }));

    } catch (error) {
        console.error("Error generating presentation:", error);
        // Return a single error slide
        return [{ 
            id: 'error-slide', 
            title: 'Error Generating Presentation', 
            content: error instanceof Error ? error.message : "An unknown error occurred."
        }];
    }
};

export const organizeWorkspace = async (items: PageItem[]): Promise<OrganizationAction[]> => {
    try {
        const ai = getAiClient();

        const simplifiedItems = items
            .filter(i => !i.parentId?.startsWith('db-')) // Exclude pages within databases
            .map(i => ({
                id: i.id,
                name: i.name,
                type: i.type,
                parentId: i.parentId,
                contentSnippet: (i.type === 'page' || i.type === 'meeting') && i.content ? i.content.substring(0, 150).replace(/\s+/g, ' ') + '...' : undefined,
        }));

        const prompt = `You are a workspace organization expert. I will provide you with a flat list of all items (folders, pages, etc.) in a user's workspace. Your task is to suggest a better organization for these items by creating folders, moving items, and renaming them.

Analyze the names and content snippets to find logical groupings. Suggest actions to create a clear, logical structure. Common patterns are grouping by project, topic, or status (e.g., 'Work', 'Personal', 'Archive').

ACTIONS:
1. CREATE_FOLDER: Create a new folder. You MUST provide 'name', 'parentId' (or null for root), and a unique 'tempId' (e.g., 'temp-folder-1').
2. MOVE_ITEM: Move an existing item. You MUST provide 'itemId' and 'newParentId'. The 'newParentId' can be an existing ID or a 'tempId' you've created in this request.
3. RENAME_ITEM: Rename an item for clarity. You MUST provide 'itemId' and 'newName'.

RULES:
- Do not suggest deleting any items.
- Only suggest changes that genuinely improve organization. If the structure is already good, return an empty array.
- The root of the workspace has a 'parentId' of null.
- Provide your response as a JSON array of action objects.

Here is the list of items:
${JSON.stringify(simplifiedItems, null, 2)}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            action: { type: Type.STRING, description: "Action: 'CREATE_FOLDER', 'MOVE_ITEM', or 'RENAME_ITEM'." },
                            name: { type: Type.STRING, description: "For CREATE_FOLDER: The new folder's name." },
                            parentId: { type: Type.STRING, description: "For CREATE_FOLDER: The parent ID (or null)." },
                            tempId: { type: Type.STRING, description: "For CREATE_FOLDER: A temporary ID like 'temp-folder-1'." },
                            itemId: { type: Type.STRING, description: "For MOVE_ITEM/RENAME_ITEM: The ID of the item to modify." },
                            newParentId: { type: Type.STRING, description: "For MOVE_ITEM: The target parent ID." },
                            newName: { type: Type.STRING, description: "For RENAME_ITEM: The new name for the item." },
                        },
                        required: ['action']
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result as OrganizationAction[];

    } catch (error) {
        console.error("Error generating organization plan:", error);
        if (error instanceof Error) {
            throw new Error(`AI Organization failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while organizing the workspace.");
    }
};
