import "@/utils/localization";

import "fast-text-encoding";
import "react-native-get-random-values";
import "@ethersproject/shims";
import "react-native-reanimated";

// Your root component
import "@/global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";

// Contexts
import { PrivyProvider } from "@privy-io/expo";
import { AnkyProvider } from "@/context/AnkyContext";
import { UserProvider } from "@/context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { base, baseGoerli, optimism } from "viem/chains";
import {
  EXPO_PUBLIC_PRIVY_APP_ID,
  EXPO_PUBLIC_PRIVY_CLIENT_ID,
} from "@/utils/environment";
import { updateAllUserSessionsOnLocalStorage } from "@/utils/localStorage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Global objects
export const unstable_settings = {
  initialRouteName: "index",
};

const queryClient = new QueryClient();

const LoadingScreen = () => {
  const [progress] = useState(new Animated.Value(0));
  const [showLoading, setShowLoading] = useState(true);
  const [progressState, setProgressState] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => {
      setShowLoading(false);
    });

    progress.addListener(({ value }) => {
      setProgressState(Math.floor(value));
    });

    return () => {
      progress.removeAllListeners();
    };
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  if (!showLoading) return null;

  return (
    <View className="flex-1 bg-black justify-center items-center p-5">
      <View className="mb-12 p-5 bg-[#1a1a1a] rounded-2xl">
        <Text className="text-white text-5xl font-[Righteous] tracking-[0.25em]">
          ANKY
        </Text>
      </View>
      <View className="relative w-4/5">
        <Text className="absolute -top-8 right-0 text-white text-3xl">
          {progressState}%
        </Text>
        <View className="h-5 bg-[#1a1a1a] rounded-lg overflow-hidden">
          <Animated.View
            className="h-full bg-[#4a90e2] rounded-lg"
            style={{
              width: progressWidth,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);

  const [loaded] = useFonts({
    Righteous: require("@/assets/fonts/Righteous-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      updateAllUserSessionsOnLocalStorage();
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PrivyProvider
      appId={EXPO_PUBLIC_PRIVY_APP_ID}
      clientId={EXPO_PUBLIC_PRIVY_CLIENT_ID}
      supportedChains={[optimism, base, baseGoerli]}
    >
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <AnkyProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <View className="flex-1">
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="+not-found"
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="settings"
                    options={{
                      presentation: "modal",
                      animation: "fade",
                      headerShown: false,
                    }}
                  />
                </Stack>
              </View>
            </ThemeProvider>
          </AnkyProvider>
        </UserProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
