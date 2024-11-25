import axios from "axios";
import { WritingSession } from "@/types/Anky";
import { prettyLog } from "@/utils/logs";
import {
  EXPO_PUBLIC_ANKY_API_URL,
  EXPO_PUBLIC_POIESIS_API_KEY,
} from "@/utils/environment";

const API_URL = EXPO_PUBLIC_ANKY_API_URL;
const POIESIS_API_KEY = EXPO_PUBLIC_POIESIS_API_KEY;

export const startWritingSession = async (
  writingSession: WritingSession,
  accessToken: string
): Promise<{ writingSession: WritingSession }> => {
  prettyLog(writingSession, "STARTING A NEW WRITING SESSION");
  try {
    let endpoint = `${API_URL}/writing-session-started`;

    const response = await axios.post(endpoint, writingSession, {
      headers: {
        "api-key": POIESIS_API_KEY!,
        token: accessToken || "",
        "User-Agent": `anky-mobile-app-${process.env.ENVIRONMENT}`,
      },
    });

    if (response.status !== 200) {
      console.error(`Unexpected response status: ${response.status}`);
      throw new Error("Failed to fetch user profile and casts");
    }

    return response.data;
  } catch (error: any) {
    console.error("Error adding new session to the database:", error);
    throw error;
  }
};

export const endWritingSession = async (
  writingSession: WritingSession,
  accessToken: string
): Promise<{ writingSession: WritingSession }> => {
  try {
    let endpoint = `${API_URL}/writing-session-ended`;

    prettyLog(writingSession, "ENDING WRITING SESSION");
    const response = await axios.post(endpoint, writingSession, {
      headers: {
        "api-key": POIESIS_API_KEY!,
        token: accessToken || "",
        "User-Agent": `anky-mobile-app-${process.env.ENVIRONMENT}`,
      },
    });

    if (response.status !== 200) {
      console.error(`Unexpected response status: ${response.status}`);
      throw new Error("Failed to fetch user profile and casts");
    }

    return response.data;
  } catch (error: any) {
    console.error("Error updating the session on the database:", error);
    throw error;
  }
};
