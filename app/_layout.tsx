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
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";

// Contexts
import { PrivyProvider } from "@privy-io/expo";
import { AnkyProvider } from "@/context/AnkyContext";
import { UserProvider } from "@/context/UserContext";
import { View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { base, baseGoerli, optimism } from "viem/chains";
import {
  EXPO_PUBLIC_PRIVY_APP_ID,
  EXPO_PUBLIC_PRIVY_CLIENT_ID,
} from "@/utils/environment";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Global objects

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Righteous: require("@/assets/fonts/Righteous-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // clearAllUserDataFromLocalStorage();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
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
              <View style={{ flex: 1 }}>
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
                </Stack>
              </View>
            </ThemeProvider>
          </AnkyProvider>
        </UserProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
