import { router, Tabs } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  Image,
} from "react-native";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import WritingGame from "@/components/Writing_Game";
import { useAnky } from "@/context/AnkyContext";
import { Header } from "@react-navigation/elements";
import { useLoginWithFarcaster, usePrivy } from "@privy-io/expo";
import { WritingSession } from "@/types/Anky";
import { getCurrentAnkyverseDay } from "@/utils/ankyverse";
import ProfileIcon from "@/assets/icons/profile.svg";
import PouchIcon from "@/assets/icons/pouch.svg";
import Playground from "@/assets/icons/playground.svg";
import Scroll from "@/assets/icons/scroll.svg";
import CreateAccountModal from "@/components/Profile/CreateAccountModal";
import { useUser } from "@/context/UserContext";
import { ModalWrapper } from "@/components/modal/ModalWrapper";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isWritingGameVisible, setIsWritingGameVisible, isUserWriting } =
    useAnky();
  const { createAccountModalVisible, setCreateAccountModalVisible } = useUser();

  const ankyverseDay = getCurrentAnkyverseDay();

  return (
    <View className="flex-1 w-full bg-white relative">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarStyle: {
            backgroundColor: "#1a1f3d",
            borderTopWidth: 2,
            borderTopColor: "#ff6b00",
            height: 90,
            position: "relative",
          },
          header: ({ route, options }) => {
            return (
              <Header
                title={options.title || route.name}
                headerStyle={{
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                }}
                headerTintColor={Colors[colorScheme ?? "light"].text}
              />
            );
          },
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Scroll
                width={88}
                height={88}
                color={color}
                style={{
                  opacity: focused ? 1 : 0.8,
                  marginTop: 33,
                }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="anky"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Playground
                width={111}
                height={111}
                color={color}
                style={{
                  opacity: focused ? 1 : 0.8,
                  marginTop: 20,
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="write"
          options={{
            headerShown: false,
            title: "",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "pencil" : "pencil-outline"}
                color={color}
                size={1}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setIsWritingGameVisible(true);
            },
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <PouchIcon
                width={111}
                height={111}
                color={color}
                style={{
                  opacity: focused ? 1 : 0.8,
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <ProfileIcon
                width={111}
                height={111}
                color={color}
                style={{
                  opacity: focused ? 1 : 0.8,
                  marginTop: 33,
                }}
              />
            ),
          }}
        />
      </Tabs>

      {!isUserWriting && (
        <View
          style={{
            position: "absolute",
            bottom: 33,
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "box-none",
            zIndex: 1000,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: ankyverseDay.currentColor.secondary,
              borderRadius: 9999,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={() => {
              Vibration.vibrate(5);
              setIsWritingGameVisible(!isWritingGameVisible);
            }}
            activeOpacity={0.9}
          >
            <Text
              style={{
                fontSize: 24,
                color: "white",
                textAlign: "center",
              }}
            >
              👽
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isWritingGameVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
          }}
        >
          <WritingGame />
        </View>
      )}

      <ModalWrapper
        isVisible={createAccountModalVisible}
        onClose={() => setCreateAccountModalVisible(false)}
      >
        <CreateAccountModal
          isVisible={createAccountModalVisible}
          onClose={() => setCreateAccountModalVisible(false)}
        />
      </ModalWrapper>
    </View>
  );
}
