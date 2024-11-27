import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { User as PrivyUser } from "@privy-io/expo";
import { prettyLog } from "./logs";
import { Anky, WritingSession } from "@/types/Anky";
import { getAllUserWrittenAnkysFromLocalStorage } from "./anky";

// Function to send writing to Anky and process the response

export async function calculateNextModalTiming(
  writing_string_so_far: string
): Promise<number> {
  console.log("⏱️ Calculating next modal timing...");
  const proposed_time_of_next_modal = 2 * 60 * 1000; // 2 minutes in milliseconds
  console.log(
    `⏰ Next modal will appear in ${proposed_time_of_next_modal / 1000} seconds`
  );
  return proposed_time_of_next_modal;
}

async function sendWritingToAnky(
  text: string,
  user: PrivyUser
): Promise<{ imageUrl: string; response: string }> {
  console.log("📝 Sending writing to Anky for processing...");
  const API_URL = process.env.EXPO_PUBLIC_ANKY_API_URL;

  try {
    console.log(`🌐 Making API request to ${API_URL}/process-writing`);
    const response = await axios.post(`${API_URL}/process-writing`, {
      writing: text,
      user: user,
      // TODO for backend: Ensure proper authentication and authorization
    });

    console.log("✨ Successfully received response from Anky");
    return {
      imageUrl: response.data.imageUrl,
      response: response.data.ankyResponse,
    };
  } catch (error) {
    console.error("❌ Error sending writing to Anky:", error);
    throw error;
  }
}

// export async function processWritingSession(
//   text: string,
//   timeSpent: number,
//   user: PrivyUser
// ) {
//   const sessionId = uuidv4();
//   const isAnky = timeSpent >= 480; // 8 minutes or more
//   const timestamp = new Date().toISOString();

//   const writingSession: WritingSession = {
//     session_id: sessionId,
//     writing: text,
//     time_spent: timeSpent,
//     starting_timestamp: new Date(timestamp),
//     is_anky: isAnky,
//   };

//   // Save the writing session to local storage
//   try {
//     const existingSessions = await AsyncStorage.getItem("writingSessions");
//     const sessions: WritingSession[] = existingSessions
//       ? JSON.parse(existingSessions)
//       : [];
//     sessions.push(writingSession);
//     await AsyncStorage.setItem("writingSessions", JSON.stringify(sessions));
//   } catch (error) {
//     console.error("Error saving writing session:", error);
//   }

//   // If it's an Anky session, process it further
//   if (isAnky) {
//     try {
//       // Send the text to Anky and get the image URL and response
//       const ankyResponse = await sendWritingToAnky(text, user);
//       writingSession.ankyImageUrl = ankyResponse.imageUrl;
//       writingSession.ankyResponse = ankyResponse.response;

//       // Update the session in storage with the image URL and Anky's response
//       const existingSessions = await AsyncStorage.getItem("writingSessions");
//       if (existingSessions) {
//         const sessions: WritingSession[] = JSON.parse(existingSessions);
//         const updatedSessions = sessions.map((session) =>
//           session.id === sessionId ? writingSession : session
//         );
//         await AsyncStorage.setItem(
//           "writingSessions",
//           JSON.stringify(updatedSessions)
//         );
//       }

//       // Update user's profile with the new Anky session
//       await updateUserProfile(writingSession);

//       // TODO for backend:
//       // 1. Store the writing session in the database
//       // 2. Associate the session with the user
//       // 3. Store the generated image URL
//       // 4. Store Anky's response
//       // 5. Implement proper error handling and retries
//       // 6. Consider implementing a queue system for processing long writings
//       // 7. Ensure data consistency between frontend and backend
//     } catch (error) {
//       console.error("Error processing Anky session:", error);
//     }
//   }

//   return writingSession;
// }

export async function storeNewDraftLocally(
  newDraft: WritingSession
): Promise<WritingSession[]> {
  console.log("📝 Attempting to store new draft locally...");
  try {
    const existing_user_drafts = await AsyncStorage.getItem("user_drafts");
    const drafts: WritingSession[] = existing_user_drafts
      ? JSON.parse(existing_user_drafts)
      : [];
    drafts.unshift(newDraft);
    await AsyncStorage.setItem("drafts", JSON.stringify(drafts));
    console.log(
      "✅ Successfully stored new draft. Total drafts:",
      drafts.length
    );
    prettyLog(newDraft, "NEW DRAFT STORED LOCALLY");
    return drafts;
  } catch (error) {
    console.error("❌ Error storing draft:", error);
    return [];
  }
}

export async function getUserLocalDrafts() {
  console.log("📚 Fetching user's local drafts...");
  try {
    const existing_user_drafts = await AsyncStorage.getItem("user_drafts");
    const drafts = existing_user_drafts ? JSON.parse(existing_user_drafts) : [];
    console.log(`📋 Found ${drafts.length} local drafts`);
    return drafts;
  } catch (error) {
    console.error("❌ Error getting user drafts:", error);
    return [];
  }
}

export async function storeNewAnkyLocally(newAnky: Anky) {
  console.log("🌟 Storing new Anky locally...");
  try {
    const existing_user_ankys = await AsyncStorage.getItem("user_ankys");
    const ankys: Anky[] = existing_user_ankys
      ? JSON.parse(existing_user_ankys)
      : [];
    ankys.unshift(newAnky);
    await AsyncStorage.setItem("user_ankys", JSON.stringify(ankys));
    console.log("✨ Successfully stored new Anky. Total Ankys:", ankys.length);
    prettyLog(newAnky, "NEW ANKY STORED LOCALLY");
  } catch (error) {
    console.error("❌ Error storing anky:", error);
  }
}

export async function getUserLocalAnkys() {
  console.log("🎭 Fetching user's local Ankys...");
  try {
    const existing_user_ankys = await AsyncStorage.getItem("user_ankys");
    const ankys = existing_user_ankys ? JSON.parse(existing_user_ankys) : [];
    console.log(`🎭 Found ${ankys.length} local Ankys`);
    return ankys;
  } catch (error) {
    console.error("❌ Error getting user ankys:", error);
    return [];
  }
}

export async function storeUserWritingSessionLocally(
  sessionLongString: string
): Promise<string[]> {
  console.log("📝 Storing writing session locally...");
  try {
    const existing_sessions = await AsyncStorage.getItem("writing_sessions");
    const sessions: string[] = existing_sessions
      ? JSON.parse(existing_sessions)
      : [];
    sessions.unshift(sessionLongString);
    const session_id = sessionLongString.split("\n")[1];
    await AsyncStorage.setItem("writing_sessions", JSON.stringify(sessions));
    await AsyncStorage.setItem(`${session_id}`, sessionLongString);
    console.log(
      `✅ Successfully stored writing session with ID: ${session_id}`
    );
    console.log(`📚 Total writing sessions: ${sessions.length}`);
    return sessions;
  } catch (error) {
    console.error("❌ Error storing writing session:", error);
    return [];
  }
}

export async function getUserLocalWritingSessions(): Promise<string[]> {
  console.log("📚 Fetching user's writing sessions...");
  try {
    const existing_sessions = await AsyncStorage.getItem(
      "writing_sessions_ids"
    );
    const sessions = existing_sessions ? JSON.parse(existing_sessions) : [];
    console.log(`📝 Found ${sessions.length} writing sessions`);
    return sessions;
  } catch (error) {
    console.error("❌ Error getting user writing sessions:", error);
    return [];
  }
}

export async function fetchWritingSessionFromId(
  session_id: string
): Promise<string | null> {
  console.log(`🔍 Fetching writing session with ID: ${session_id}`);
  try {
    const this_writing_session = await AsyncStorage.getItem(`${session_id}`);
    console.log(
      this_writing_session ? "✅ Session found!" : "⚠️ Session not found"
    );
    return this_writing_session ? this_writing_session : null;
  } catch (error) {
    console.error("❌ Error fetching writing session:", error);
    return null;
  }
}

export async function getUserLocalCollectedAnkys() {
  console.log("🎭 Fetching user's collected Ankys...");
  try {
    const user_collected_ankys = await AsyncStorage.getItem("collected_ankys");
    const ankys = user_collected_ankys ? JSON.parse(user_collected_ankys) : [];
    console.log(`💫 Found ${ankys.length} collected Ankys`);
    return ankys;
  } catch (error) {
    console.error("❌ Error getting user collected ankys:", error);
    return [];
  }
}

export async function fetchLocalWritingSessionFromId(
  session_id: string
): Promise<string | null> {
  console.log(`🔍 Fetching local writing session with ID: ${session_id}`);
  const this_writing_session = await AsyncStorage.getItem(`${session_id}`);
  console.log(
    this_writing_session
      ? "✅ Local session found!"
      : "⚠️ Local session not found"
  );
  return this_writing_session ? this_writing_session : null;
}

export async function getAnkyUserLastWritingSession(): Promise<string | null> {
  console.log("📜 Fetching user's last writing session...");
  const writingSessions = await getUserLocalWritingSessions();
  const last_writing_session_id = writingSessions[writingSessions.length - 1];
  console.log(`🔍 Looking up session ID: ${last_writing_session_id}`);
  const last_writing_session = await fetchLocalWritingSessionFromId(
    last_writing_session_id as unknown as string
  );
  console.log(
    last_writing_session
      ? "✅ Last session retrieved!"
      : "⚠️ No last session found"
  );
  return last_writing_session;
}
