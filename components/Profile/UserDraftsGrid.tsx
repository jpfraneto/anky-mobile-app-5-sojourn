import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Animated,
  PanResponder,
  TouchableOpacity,
  Alert,
} from "react-native";
import { WritingSession } from "@/types/Anky";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserDraftsGridProps {}

const UserDraftsGrid: React.FC<UserDraftsGridProps> = () => {
  const [drafts, setDrafts] = useState<
    { id: string; text: string; timestamp: number; duration: number }[]
  >([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const storedDrafts = await AsyncStorage.getItem("anky_user_drafts");
      if (!storedDrafts) return;

      const draftSessions = JSON.parse(storedDrafts);
      const processedDrafts = draftSessions
        .map((draft: string) => {
          const [userId, sessionId, prompt, timestamp, ...keystrokes] =
            draft.split("\n");

          // Calculate total duration by summing keystroke times + 8s timeout
          const duration =
            keystrokes.reduce((total, stroke) => {
              const time = parseFloat(stroke.split(" ")[1]);
              return total + time;
            }, 0) + 8; // Add 8s timeout

          // Only include if duration < 8 minutes (480s)
          if (duration < 480) {
            return {
              id: sessionId,
              text: keystrokes.map((k) => k.split(" ")[0]).join(""),
              timestamp: parseInt(timestamp),
              duration,
            };
          }
          return null;
        })
        .filter(Boolean);

      setDrafts(processedDrafts);
    } catch (error) {
      console.error("Error loading drafts:", error);
    }
  };

  if (!drafts?.length) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-500 text-center">
          You don't have any drafts yet.
        </Text>
        <Text className="text-sm text-gray-400 text-center mt-2">
          Writing sessions under 8 minutes will appear here.
        </Text>
      </View>
    );
  }

  const DraftItem = ({
    draft,
    index,
  }: {
    draft: { id: string; text: string; timestamp: number; duration: number };
    index: number;
  }) => {
    const position = new Animated.Value(0);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          position.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          Animated.spring(position, {
            toValue: -75,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    const handleDelete = async () => {
      Alert.alert(
        "Delete Draft",
        "Are you sure you want to delete this draft?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const storedDrafts = await AsyncStorage.getItem(
                  "anky_user_drafts"
                );
                if (storedDrafts) {
                  const allDrafts = JSON.parse(storedDrafts);
                  const updatedDrafts = allDrafts.filter(
                    (d: string) => !d.includes(draft.id)
                  );
                  await AsyncStorage.setItem(
                    "anky_user_drafts",
                    JSON.stringify(updatedDrafts)
                  );
                  loadDrafts(); // Reload drafts after deletion
                }
              } catch (error) {
                console.error("Error deleting draft:", error);
              }
            },
          },
        ]
      );
    };

    return (
      <View className="relative">
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{ translateX: position }],
          }}
          className="bg-white border-b border-gray-200 p-4"
        >
          <Text className="text-lg font-medium" numberOfLines={1}>
            {draft.text.substring(0, 50)}...
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {new Date(draft.timestamp).toLocaleDateString()} (
            {Math.round(draft.duration)}s)
          </Text>
        </Animated.View>
        <TouchableOpacity
          onPress={handleDelete}
          className="absolute right-0 top-0 bottom-0 bg-red-500 justify-center w-[75px]"
        >
          <Text className="text-white text-center">Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {drafts.map((draft, index) => (
        <DraftItem key={draft.id} draft={draft} index={index} />
      ))}
    </View>
  );
};

export default UserDraftsGrid;
