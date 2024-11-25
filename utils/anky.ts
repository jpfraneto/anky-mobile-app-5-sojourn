import { sendWritingConversationToAnky } from "@/api/anky";
import { prettyLog } from "@/utils/logs";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function sendWritingSessionConversationToAnky(
  conversation_so_far: string[]
): Promise<string> {
  try {
    prettyLog(conversation_so_far, "the conversation so far is");

    const new_prompt = await sendWritingConversationToAnky(conversation_so_far);
    prettyLog(new_prompt, "the anky response is NEW PROMPT:");

    return new_prompt;
  } catch (error) {
    console.error("Error processing writing session:", error);
    throw error;
  }
}

export function extractSessionDataFromLongString(session_long_string: string): {
  user_id: string;
  session_id: string;
  prompt: string;
  starting_timestamp: number;
  session_text: string;
  total_time_written: number;
  word_count: number;
  average_wpm: number;
} {
  const lines = session_long_string.split("\n");
  const user_id = lines[0];
  const session_id = lines[1];
  const prompt = lines[2];
  const starting_timestamp = parseInt(lines[3]);

  // Process typing data starting from line 4
  let session_text = "";
  let total_time = 0;
  let total_chars = 0;
  for (let i = 4; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const [char, timeStr] = lines[i].split(/\s+/);
    const time = parseFloat(timeStr);

    // Handle backspace
    if (char === "Backspace") {
      session_text = session_text.slice(0, -1);
    }
    // Handle special characters
    else if (char === "Space" || char === "") {
      session_text += " ";
    } else if (char === "Enter") {
      session_text += "\n";
    }
    // Handle regular characters
    else if (char.length === 1) {
      session_text += char;
    }
    total_chars += 1;
    total_time += time;
  }

  // Filter out multiple consecutive spaces and trim
  session_text = session_text.replace(/\s+/g, " ").trim();

  const word_count = session_text
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Calculate average time between keystrokes in milliseconds
  const avgKeystrokeTime = total_time / total_chars;

  // Calculate how many keystrokes can be made in a minute
  const keystrokesPerMinute = 60 / avgKeystrokeTime;

  // Assuming average word length of 5 characters plus a space (6 keystrokes per word)
  const average_wpm = Number((keystrokesPerMinute / 6).toFixed(2));
  // Add 8 seconds (8000ms) as per requirement

  const result = {
    user_id,
    session_id,
    prompt,
    starting_timestamp,
    session_text,
    total_time_written: 1000 * Math.floor(total_time + 8),
    word_count,
    average_wpm,
  };

  return result;
}

export async function getAllUserWrittenAnkysFromLocalStorage(): Promise<
  string[]
> {
  try {
    const allUserWrittenAnkys = await AsyncStorage.getItem(
      "all_user_written_ankys"
    );
    if (!allUserWrittenAnkys) return [];
    return JSON.parse(allUserWrittenAnkys);
  } catch (error) {
    console.error("Error getting all user written ankys:", error);
    return [];
  }
}

export async function updateAllUserWrittenAnkysOnLocalStorage(
  new_writing_session_long_string: string
) {
  const allUserWrittenAnkys = await getAllUserWrittenAnkysFromLocalStorage();
  const newAnkys = [...allUserWrittenAnkys, new_writing_session_long_string];
  await AsyncStorage.setItem(
    "all_user_written_ankys",
    JSON.stringify(newAnkys)
  );
}
