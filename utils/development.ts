import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearAllUserDataFromLocalStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw new Error("Failed to clear user data");
  }
};
