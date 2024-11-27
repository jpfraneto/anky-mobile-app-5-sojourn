import AsyncStorage from "@react-native-async-storage/async-storage";

export async function startUserSessionOnLocalStorage() {
  try {
    await updateAllUserSessionsOnLocalStorage();
    const displayButton = await AsyncStorage.getItem("display_anky_button");
  } catch (error) {
    console.log(error, "ERROR STARTING USER SESSION ON LOCAL STORAGE");
  }
}

export async function updateAllUserSessionsOnLocalStorage() {
  const allUserSessions = await getAllUserLoginsToTheAppArray();
  const currentTimestamp = new Date().getTime();
  const updatedSessions = allUserSessions
    ? `${allUserSessions}\n${currentTimestamp}`
    : `${currentTimestamp}`;
  await AsyncStorage.setItem("allUserLoginsToTheAppArray", updatedSessions);
}

export async function getAllUserLoginsToTheAppArray() {
  const allUserLoginsToTheAppArray = await AsyncStorage.getItem(
    "allUserLoginsToTheAppArray"
  );
  return allUserLoginsToTheAppArray;
}
