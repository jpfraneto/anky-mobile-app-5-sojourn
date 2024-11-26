import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getLandingFeed } from "@/api/feed";
import { useTranslation } from "react-i18next";
import Feed from "@/components/feed/Feed";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "followed">("all");
  const { t } = useTranslation();

  const { data: ankyFeed, isLoading } = useQuery({
    queryKey: ["ankyFeed", activeTab],
    queryFn: async () => {
      return getLandingFeed({
        cursor: "",
        limit: activeTab === "all" ? 24 : 12,
        fid: 18350,
      });
    },
  });

  return (
    <View className="flex-1 bg-black flex-1 flex-col items-center">
      {/* Tab Navigation */}
      <View className="flex-row justify-center space-x-8 pt-16 pb-4">
        {["all", "followed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as "all" | "followed")}
            className={`px-6 py-2 rounded-full ${
              activeTab === tab ? "bg-white/10" : ""
            }`}
          >
            <Text
              className={`text-white text-lg ${
                activeTab === tab ? "opacity-100" : "opacity-60"
              }`}
            >
              {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Feed
        casts={ankyFeed?.casts || []}
        cursor={ankyFeed?.next?.cursor || ""}
        onLoadMore={async (cursor) => {
          await getLandingFeed({
            cursor: cursor,
            limit: activeTab === "all" ? 24 : 12,
            fid: 16098,
          });
        }}
        isLoading={isLoading}
      />
    </View>
  );
}
