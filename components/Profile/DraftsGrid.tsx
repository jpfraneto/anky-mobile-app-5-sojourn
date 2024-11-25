import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DraftElement from "./DraftElement";
import { WritingSession } from "../../types/Anky";

interface DraftsGridProps {
  drafts: WritingSession[];
}

const DraftsGrid: React.FC<DraftsGridProps> = ({ drafts }) => {
  const navigation = useNavigation();

  const handleDeleteDraft = async (draftId: string) => {
    // TODO: Implement delete functionality
  };

  const renderDraftItem = ({ item }: { item: WritingSession }) => {
    return (
      <View className="flex-row items-center">
        <View className="flex-1">
          <DraftElement
            preview={
              item.writing ? item.writing?.substring(0, 100) + "..." : ""
            }
            wordCount={item.writing ? item.writing?.split(" ").length : 0}
            createdAt={new Date(item.starting_timestamp!).toLocaleString()}
            onPress={() => alert("draft tapped")}
          />
        </View>
        <TouchableOpacity
          className="bg-red-500 justify-center items-center w-16 h-16 ml-2 rounded-lg"
          onPress={() => handleDeleteDraft(item?.session_id ?? "")}
        >
          <Text className="text-white">Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!drafts || drafts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 text-center">
          Drafts are unfinished (less than 480 seconds) writing sessions.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={drafts.filter((draft) => draft.status === "draft")}
        renderItem={renderDraftItem}
        keyExtractor={(item) => item?.session_id ?? ""}
        className="px-4"
      />
    </View>
  );
};

export default DraftsGrid;
