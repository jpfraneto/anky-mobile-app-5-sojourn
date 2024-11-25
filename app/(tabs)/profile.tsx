import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Alert,
  Animated,
  Easing,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";

import { usePrivy } from "@privy-io/expo";

import { Anky, WritingSession } from "@/types/Anky";
import UserAnkysGrid from "@/components/Profile/UserAnkysGrid";
import UserDraftsGrid from "@/components/Profile/UserDraftsGrid";
import UsersCollectedDisplay from "@/components/Profile/UsersCollectedDisplay";

import { useQuery } from "@tanstack/react-query";
import {
  getUserAnkys,
  getUserCollectedAnkys,
  getUserDrafts,
  getUserProfile,
} from "@/api/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";

const ProfileScreen = ({
  setShowWritingGame,
}: {
  setShowWritingGame: (show: boolean) => void;
}) => {
  const { user } = usePrivy();
  const { ankyUser, setCreateAccountModalVisible } = useUser();
  const fid = ankyUser?.farcaster_account?.fid || 18350;
  const [viewMode, setViewMode] = useState<"ankys" | "drafts" | "collected">(
    "ankys"
  );
  const { logout } = usePrivy();

  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userProfile", fid],
    queryFn: () => {
      if (!fid) throw new Error("No FID available");
      return getUserProfile(fid.toString());
    },
    enabled: !!fid,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userAnkys, isLoading: ankysLoading } = useQuery({
    queryKey: ["userAnkys", fid],
    queryFn: () => getUserAnkys(fid.toString()),
    enabled: !!fid,
  });

  const { data: userDrafts, isLoading: draftsLoading } = useQuery({
    queryKey: ["userDrafts", fid],
    queryFn: () => getUserDrafts(fid.toString()),
    enabled: !!fid,
  });

  const { data: collectedAnkys, isLoading: collectedLoading } = useQuery({
    queryKey: ["collectedAnkys", fid],
    queryFn: () => getUserCollectedAnkys(fid.toString()),
    enabled: !!fid,
  });

  const BlurredText = ({
    text,
    fontSize = 16,
  }: {
    text: string;
    fontSize?: number;
  }) => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animate = () => {
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: 2,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(translateY, {
            toValue: -2,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]).start(() => animate());
      };

      animate();
    }, []);

    return (
      <Animated.View style={{ alignSelf: "flex-start" }}>
        <Text
          style={{
            fontSize: fontSize,
            color: "#000",
            opacity: 0.2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            textAlign: "left",
          }}
        >
          {text}
        </Text>
      </Animated.View>
    );
  };

  if (profileLoading)
    return (
      <View>
        <Text>Loading profile...</Text>
      </View>
    );

  if (profileError) {
    return (
      <View>
        <Text>Error loading profile</Text>
        <TouchableOpacity onPress={() => refetchProfile()}>
          <Text>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderContent = () => {
    switch (viewMode) {
      case "ankys":
        return (
          <View className="flex-1 p-4">
            {ankysLoading ? (
              <Text>Loading ankys...</Text>
            ) : (
              <Text>Ankys content here</Text>
            )}
          </View>
        );
      case "drafts":
        return (
          <View className="flex-1 p-4">
            {draftsLoading ? (
              <Text>Loading drafts...</Text>
            ) : (
              <Text>Drafts content here</Text>
            )}
          </View>
        );
      case "collected":
        return (
          <View className="flex-1 p-4">
            {collectedLoading ? (
              <Text>Loading collected ankys...</Text>
            ) : (
              <Text>Collected content here</Text>
            )}
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-white pt-10">
      <View className="items-center p-5">
        <View className="flex flex-row justify-between w-full">
          {ankyUser?.farcaster_account?.username ? (
            <Text className="text-2xl font-bold mr-auto pl-2 mb-2 text-gray-600">
              @{ankyUser?.farcaster_account?.username}
            </Text>
          ) : (
            <BlurredText text="@ಹನುಮಾನ್" fontSize={22} />
          )}

          <View className="flex flex-row gap-4">
            <Link href="/settings" className="bg-blue-500 rounded-full p-2">
              <Ionicons name="settings-outline" size={24} color="white" />
            </Link>

            <TouchableOpacity
              onPress={() => alert("Share")}
              className="bg-blue-500 rounded-full p-2"
            >
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex flex-row justify-between w-full items-center">
          <View className="relative">
            <Image
              source={{
                uri:
                  ankyUser?.farcaster_account?.pfp_url ||
                  "https://github.com/jpfraneto/images/blob/main/anky.png?raw=true",
              }}
              className="w-24 h-24 rounded-full mb-2.5"
            />
            {!ankyUser && (
              <Pressable
                onPress={() => setCreateAccountModalVisible(true)}
                className="absolute inset-0 bg-white rounded-full items-center w-24 h-24 justify-center"
              >
                <Ionicons name="log-in-outline" size={32} color="black" />
                <Text className="text-white text-xs mt-1">Create Account</Text>
              </Pressable>
            )}
          </View>

          <View className="flex flex-row gap-4 flex-1 px-16 justify-between">
            <View className="items-center">
              <Text className="text-3xl font-bold">
                {userAnkys?.length || 0}
              </Text>
              <Text className="text-xl text-gray-600">ankys</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold">
                {collectedAnkys?.length || 1}
              </Text>
              <Text className="text-xl text-gray-600">sadhana</Text>
            </View>
          </View>
        </View>
        {userProfile?.display_name ? (
          <Text className="text-left text-2xl mt-2 w-full font-bold mb-1">
            {userProfile?.display_name}
          </Text>
        ) : (
          <BlurredText text="ಪವನಸುತ" />
        )}
        {userProfile?.profile?.bio?.text ? (
          <Text className="text-lg mb-1 w-full text-left">
            {userProfile?.profile?.bio?.text}
          </Text>
        ) : (
          <BlurredText text="ಜಯ ಶ್ರೀರಾಮ | ಭಕ್ತಿಯುತ ವಾನರ | ರಾಮದೂತ | ಪವನಪುತ್ರ | ಮಹಾವೀರ | ಉಡುಪಿಗೆ ಹೋದರೆ ಪಕ್ಕಾ ನೆಚ್ಚಿನ ದೋಸೆ" />
        )}
        <ElementsOfProfile viewMode={viewMode} setViewMode={setViewMode} />
        {renderContent()}
      </View>
    </View>
  );
};

export default ProfileScreen;

const ElementsOfProfile = ({
  viewMode,
  setViewMode,
}: {
  viewMode: "ankys" | "drafts" | "collected";
  setViewMode: (viewMode: "ankys" | "drafts" | "collected") => void;
}) => {
  return (
    <View className="flex-row mt-2">
      <TouchableOpacity
        className={`border-b-2 ${
          viewMode === "ankys" ? "border-gray-300" : "border-transparent"
        } px-4 py-2 mr-4`}
        onPress={() => setViewMode("ankys")}
      >
        <Text
          className={`${
            viewMode === "ankys" ? "text-gray-700 font-medium" : "text-gray-500"
          }`}
        >
          Ankys
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`border-b-2 ${
          viewMode === "drafts" ? "border-gray-300" : "border-transparent"
        } px-4 py-2 mr-4`}
        onPress={() => setViewMode("drafts")}
      >
        <Text
          className={`${
            viewMode === "drafts"
              ? "text-gray-700 font-medium"
              : "text-gray-500"
          }`}
        >
          Drafts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`border-b-2 ${
          viewMode === "collected" ? "border-gray-300" : "border-transparent"
        } px-4 py-2`}
        onPress={() => setViewMode("collected")}
      >
        <Text
          className={`${
            viewMode === "collected"
              ? "text-gray-700 font-medium"
              : "text-gray-500"
          }`}
        >
          Collected
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ElementsOfProfileContent = ({
  viewMode,
  userAnkys,
  userDrafts,
  userCollectedAnkys,
}: {
  viewMode: "ankys" | "drafts" | "collected";
  userAnkys: Anky[];
  userDrafts: WritingSession[];
  userCollectedAnkys: Anky[];
}) => {
  return (
    <ScrollView className="flex-1">
      {viewMode === "ankys" && <UserAnkysGrid userAnkys={userAnkys} />}
      {viewMode === "drafts" && <UserDraftsGrid userDrafts={userDrafts} />}
      {viewMode === "collected" && (
        <UsersCollectedDisplay userCollectedAnkys={userCollectedAnkys} />
      )}
    </ScrollView>
  );
};
