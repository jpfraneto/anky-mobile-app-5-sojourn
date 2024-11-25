import axios, { AxiosError } from "axios";
import { WritingSession } from "@/types/Anky";
import { prettyLog } from "@/utils/logs";
import {
  EXPO_PUBLIC_ANKY_API_URL,
  EXPO_PUBLIC_POIESIS_API_KEY,
} from "@/utils/environment";

const API_URL = EXPO_PUBLIC_ANKY_API_URL;
const POIESIS_API_KEY = EXPO_PUBLIC_POIESIS_API_KEY;

export const processInitialWritingSessions = async (
  writingSessions: WritingSession[],
  user_id: string
): Promise<{ message: string; streamUrl: string }> => {
  try {
    const endpoint = `${API_URL}/anky/onboarding`;

    const response = await axios.post(
      endpoint,
      { writingSessions, user_id },
      {
        headers: {
          "api-key": POIESIS_API_KEY!,
          token: "",
          "User-Agent": `anky-mobile-app-${process.env.ENVIRONMENT}`,
        },
      }
    );

    if (response.status !== 200) {
      console.error("Failed to process writing sessions:", response.status);
      throw new Error("Failed to process writing sessions");
    }

    // The backend should return a streaming URL and initial message
    const { message, streamUrl } = response.data;

    return {
      message,
      streamUrl,
    };
  } catch (error) {
    console.error("Error processing writing sessions:", error);
    throw error;
  }
};

export const sendWritingConversationToAnky = async (
  conversation_so_far: string[]
): Promise<string> => {
  try {
    prettyLog(conversation_so_far, "the conversation so far is");
    const endpoint = `${API_URL}/anky/process-writing-conversation`;
    const response = await axios.post(
      endpoint,
      { conversation_so_far },
      {
        headers: {
          "api-key": POIESIS_API_KEY!,
          token: "",
          "User-Agent": `anky-mobile-app-${process.env.ENVIRONMENT}`,
        },
      }
    );

    if (response.status !== 200) {
      console.error("Failed to send writing string:", response.status);
      throw new Error("Failed to send writing string");
    }
    prettyLog(response.data, "the response data is:");
    return response.data.prompt;
  } catch (error: any) {
    console.error("Error sending writing string:", error);
    throw error;
  }
};
