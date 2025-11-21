import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { EntryType } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your environment.");
  }

  return new GoogleGenAI({ apiKey });
};

const logWorkEntryFunctionDeclaration: FunctionDeclaration = {
  name: 'logWorkEntry',
  description: 'Logs a work entry based on user input. It can be a time range, a duration, or a status for a specific job and date.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      jobName: {
        type: Type.STRING,
        description: 'The name of the job the user worked on. e.g., "Job 1", "Freelance Project"'
      },
      date: {
        type: Type.STRING,
        description: 'The date of the work entry in YYYY-MM-DD format. Infer from context like "today", "yesterday", or a specific date.'
      },
      entryType: {
        type: Type.STRING,
        enum: [EntryType.TimeRange, EntryType.Duration, EntryType.Status],
        description: 'The type of entry. Use "time_range" for start/end times, "duration" for a number of hours, and "status" for entries like "off" or "holiday".'
      },
      startTime: {
        type: Type.STRING,
        description: 'The start time in 24-hour HH:mm format. Required if entryType is "time_range". e.g., "09:00", "17:30"'
      },
      endTime: {
        type: Type.STRING,
        description: 'The end time in 24-hour HH:mm format. Required if entryType is "time_range". e.g., "17:00"'
      },
      durationHours: {
        type: Type.NUMBER,
        description: 'The duration of work in hours. Required if entryType is "duration".'
      },
      status: {
        type: Type.STRING,
        description: 'The status for the day. Required if entryType is "status". e.g., "worked", "off", "holiday", "sick"'
      },
    },
    required: ['jobName', 'date', 'entryType'],
  }
};

export const parseWorkLogWithGemini = async (prompt: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Your task is to parse a user's request to log their work time and call the logWorkEntry tool.
      Current date for context is ${new Date().toLocaleDateString('en-CA')}.
      Analyze the user's prompt carefully to extract all necessary parameters.
      User prompt: "${prompt}"`,
      config: {
        tools: [{ functionDeclarations: [logWorkEntryFunctionDeclaration] }],
      },
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'logWorkEntry') {
        return call.args;
      }
    }
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to communicate with the AI service.");
  }
};
