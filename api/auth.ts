import axios from "axios";

import { User as PrivyUser } from "@privy-io/expo";
import {
  EXPO_PUBLIC_ANKY_API_URL,
  EXPO_PUBLIC_POIESIS_API_KEY,
} from "@/utils/environment";
import { prettyLog } from "@/utils/logs";
import { AnkyUser } from "@/types/User";

const API_URL = EXPO_PUBLIC_ANKY_API_URL;
const POIESIS_API_KEY = EXPO_PUBLIC_POIESIS_API_KEY;

export const sendNewUserToPoiesis = async (
  user: PrivyUser,
  ankyUser: AnkyUser,
  accessToken: string
): Promise<void> => {
  prettyLog(accessToken, "accessToken");
  prettyLog(user, "user");
  prettyLog(ankyUser, "ankyUser");

  if (!user || !ankyUser) {
    throw new Error("Missing required user data for registration");
  }

  if (!API_URL || !POIESIS_API_KEY) {
    throw new Error("Missing required environment variables");
  }

  try {
    if (!accessToken) {
      throw new Error("Failed to obtain Privy access token");
    }

    const endpoint = `${API_URL}/user/register-privy-user`;

    const response = await axios.post(
      endpoint,
      {
        user: { ...user, user_id: ankyUser.id },
        ankyUser,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": POIESIS_API_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Registration failed with status ${response.status}: ${response.statusText}`
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Network or server error during registration:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        code: error.code,
      });
      throw new Error(
        `Registration failed: ${error.response?.data?.message || error.message}`
      );
    }
    console.error("Unexpected error during registration:", error);
    throw new Error("An unexpected error occurred during registration");
  }
};

export const postNewUser = async (
  user: PrivyUser
): Promise<{ user: PrivyUser }> => {
  try {
    let endpoint = `${API_URL}/user`;

    const response = await axios.post(endpoint, user, {
      headers: {
        "api-key": POIESIS_API_KEY!,
        token: "",
        "User-Agent": `anky-mobile-app-${process.env.ENVIRONMENT}`,
      },
    });

    if (response.status !== 200) {
      console.error(`Unexpected response status: ${response.status}`);
      throw new Error("Failed to fetch user profile and casts");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching user profile or casts:", error);
    throw error;
  }
};
