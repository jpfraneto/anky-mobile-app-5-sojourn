import AsyncStorage from "@react-native-async-storage/async-storage";

// This function is to add the writing session id to the local storage
export async function addWritingSessionToLocalStorageSimple(
  session_id: string
) {
  // Get existing writing sessions from storage
  const writingSessions = await AsyncStorage.getItem("writing_sessions.txt");

  // If there are existing sessions, append the new one on a new line
  if (writingSessions) {
    const updatedSessions = writingSessions + "\n" + session_id;
    await AsyncStorage.setItem("writing_sessions.txt", updatedSessions);
  } else {
    // If no existing sessions, create new file with first session
    await AsyncStorage.setItem("writing_sessions.txt", session_id);
  }
}

export async function updateWritingSessionOnLocalStorageSimple(
  session_id: string,
  newLongString: string
) {
  try {
    await AsyncStorage.setItem(`${session_id}.txt`, newLongString);
  } catch (error) {
  }
}
