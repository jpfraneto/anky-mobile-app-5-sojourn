import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import React from "react";
import { usePrivy } from "@privy-io/expo";
import { prettyLog } from "@/utils/logs";

const Settings = () => {
  const { logout, user, isReady } = usePrivy();
  const onLogout = () => {
    console.log("logging out", user);
    logout();
  };
  const settingsOptions = [
    {
      title: "Account",
      items: [
        { label: "Profile", onPress: () => {} },
        { label: "Privacy", onPress: () => {} },
        { label: "Security", onPress: () => {} },
      ],
    },
    {
      title: "Preferences",
      items: [
        { label: "Notifications", onPress: () => {} },
        { label: "Display", onPress: () => {} },
        { label: "Language", onPress: () => {} },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Help Center", onPress: () => {} },
        { label: "Contact Us", onPress: () => {} },
        { label: "About", onPress: () => {} },
      ],
    },
  ];

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold">Loading...</Text>
      </View>
    );
  }
  prettyLog(user, "THE USER ISSS");

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-center items-center py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {settingsOptions.map((section, index) => (
          <View key={index} className="mt-6 px-4">
            <Text className="text-lg font-semibold mb-2 text-gray-800">
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                onPress={item.onPress}
                className="flex-row justify-between items-center py-4 border-b border-gray-100"
              >
                <Text className="text-base text-gray-700">{item.label}</Text>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
      {user && (
        <Pressable onPress={onLogout} className="bg-red-500 p-8">
          <Text className="text-center text-white font-bold text-2xl">
            Logout
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default Settings;
