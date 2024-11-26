import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Vibration,
} from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import uuid from "react-native-uuid";
import { Keystroke } from "@/types/Anky";
import { useAnky } from "@/context/AnkyContext";
import { useUser } from "@/context/UserContext";
import { WritingSession } from "@/types/Anky";
import { WritingProgressBar, SessionEndScreen } from "./SessionScreens";
import { useTranslation } from "react-i18next";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { prettyLog } from "@/utils/logs";
import { getCurrentAnkyverseDay } from "@/utils/ankyverse";
import {
  addWritingSessionToLocalStorageSimple,
  updateWritingSessionOnLocalStorageSimple,
} from "@/utils/simple_writing_game";

import { updateAllUserWrittenAnkysOnLocalStorage } from "@/utils/anky";
import WritingGameModal from "./WritingGameModal";
import {
  EXPO_PUBLIC_SESSION_TARGET_TIME,
  EXPO_PUBLIC_TIME_BETWEEN_KEYSTROKES,
} from "@/utils/environment";
import { getLocales } from "expo-localization";
import { sendWritingConversationToAnky } from "@/api/anky";
import { storeUserWritingSessionLocally } from "@/utils/writingGame";

const { height } = Dimensions.get("window");

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const LOCALIZED_PROMPTS: { [key: string]: string } = {
  en: "tell me who you are",
  zh: "告诉我你是谁",
  hi: "मुझे बताओ तुम कौन हो",
  es: "dime quién eres",
  ar: "أخبرني من أنت",
  bn: "আমাকে বলো তুমি কে",
  pt: "diga-me quem você é",
  ru: "скажи мне, кто ты",
  ja: "あなたは誰か教えてください",
  pa: "ਮੈਨੂੰ ਦੱਸੋ ਤੁਸੀਂ ਕੌਣ ਹੋ",
  de: "sag mir wer du bist",
  jv: "kandha karo sopo kowé",
  ko: "당신이 누구인지 말해주세요",
  fr: "dis-moi qui tu es",
  te: "నువ్వు ఎవరో చెప్పు",
  mr: "मला सांग तू कोण आहेस",
  tr: "bana kim olduğunu söyle",
  ta: "நீ யார் என்று சொல்",
  vi: "hãy cho tôi biết bạn là ai",
  it: "dimmi chi sei",
};

const WritingGame = () => {
  const {
    writingSession,
    setWritingSession,
    setIsWritingGameVisible,
    setDidUserWriteToday,
    conversationWithAnky,
    setIsUserWriting,
    setConversationWithAnky,
  } = useAnky();
  const { ankyUser } = useUser();

  const [ankyPromptStreaming, setAnkyPromptStreaming] = useState<string>("");
  const [text, setText] = useState("");
  const [newAnkyPrompt, setNewAnkyPrompt] = useState<string | null>(null);

  const [deviceLanguage, setDeviceLanguage] = useState<string>("en");

  // Writing game elements
  const [keystrokes, setKeystrokes] = useState<string>("");
  const [sessionBecameAnky, setSessionBecameAnky] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [changeBackgroundColor, setChangeBackgroundColor] = useState(false);
  const [ankyResponseReady, setAnkyResponseReady] = useState(false);
  const [timeSinceLastKeystroke, setTimeSinceLastKeystroke] = useState(0);
  const [writingSessionId, setWritingSessionId] = useState<string>("");
  const [sessionLongString, setSessionLongString] = useState<string>("");
  const [preparingWritingSession, setPreparingWritingSession] = useState(true);
  const [isWritingSessionModalOpen, setIsWritingSessionModalOpen] =
    useState(false);
  const keystrokeQueue = useRef<Keystroke[]>([]);
  const processingRef = useRef(false);

  const textInputRef = useRef<TextInput>(null);
  const lastKeystrokeTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<number | null>(null);

  const { t } = useTranslation("self-inquiry");

  const CHAR_DELAY = 33;
  const TIMEOUT_DURATION = EXPO_PUBLIC_TIME_BETWEEN_KEYSTROKES;
  const TARGET_SESSION_DURATION = EXPO_PUBLIC_SESSION_TARGET_TIME;

  useEffect(() => {
    resetAllWritingGameState();
    const initializeLanguage = () => {
      const userLanguage = getLocales()[0]?.languageCode ?? "en";
      setDeviceLanguage(
        (userLanguage ?? "en") in LOCALIZED_PROMPTS
          ? userLanguage ?? "en"
          : "en"
      );
    };
    initializeLanguage();
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    if (writingSession?.status === "writing") {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        if (lastKeystrokeTime.current) {
          setTimeSinceLastKeystroke(
            (currentTime - lastKeystrokeTime.current) / 1000
          );
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [writingSession]);

  useEffect(() => {
    const streamPrompt = async () => {
      let currentIndex = 0;
      let prompt =
        (await AsyncStorage.getItem("upcoming_prompt")) ??
        t("self-inquiry:upcoming_prompt", {
          defaultValue: "tell me who you are",
        });

      setConversationWithAnky((prev) => {
        if (prev.length === 0 || prev[prev.length - 1] !== prompt) {
          return [...prev, prompt];
        }
        return prev;
      });
      const interval = setInterval(() => {
        if (prompt && currentIndex < prompt.length) {
          setAnkyPromptStreaming(prompt.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, CHAR_DELAY);

      return () => clearInterval(interval);
    };

    if (preparingWritingSession) {
      streamPrompt();
    }
  }, [preparingWritingSession]);

  const handleScreenTap = async () => {
    if (!writingSession) {
      const session_id = uuid.v4();

      Vibration.vibrate(100);
      setWritingSession({
        session_id: session_id,
        status: "writing",
        starting_timestamp: new Date(),
      } as WritingSession);
      setTimeout(() => {
        openWritingGameInSessionModal(
          new Date().getTime() - sessionStartTime.current!
        );
      }, 10 * 1000);
      setTimeout(() => {
        openWritingGameInSessionModal(
          new Date().getTime() - sessionStartTime.current!
        );
      }, 4 * 60 * 1000);
      setTimeout(() => {
        openWritingGameInSessionModal(
          new Date().getTime() - sessionStartTime.current!
        );
      }, 6 * 60 * 1000);
      setPreparingWritingSession(false);
      setAnkyResponseReady(false);
      setIsUserWriting(true);
      let prompt =
        (await AsyncStorage.getItem("upcoming_prompt")) ??
        t("self-inquiry:upcoming_prompt", {
          defaultValue: "tell me who you are",
        });
      const now = new Date();
      let newSessionLongString = `${
        ankyUser?.id
      }\n${session_id}\n${prompt}\n${now.getTime()}\n`;
      setSessionLongString(newSessionLongString);
      await addWritingSessionToLocalStorageSimple(session_id);
      await updateWritingSessionOnLocalStorageSimple(
        session_id,
        sessionLongString
      );
      setWritingSessionId(session_id);

      sessionStartTime.current = now.getTime();
      lastKeystrokeTime.current = now.getTime();
      setTimeSinceLastKeystroke(0);

      if (Platform.OS === "ios" || Platform.OS === "android") {
        Keyboard.dismiss();
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
      } else {
        textInputRef.current?.focus();
      }
    }
  };

  const handleSessionEnded = async () => {
    try {
      if (keystrokeQueue.current.length > 0) {
        await processKeystrokeQueue();
      }
      setIsUserWriting(false);
      // setDidUserWriteToday(true);
      prettyLog(sessionLongString, "THE WRITING SESSION LONG STRING IS");
      await storeUserWritingSessionLocally(writingSessionId, sessionLongString);

      setWritingSession({
        ...writingSession,
        status: "completed",
      } as WritingSession);

      const elapsedTime =
        new Date().getTime() -
        new Date(writingSession?.starting_timestamp!).getTime();
      prettyLog(elapsedTime, "THE ELAPSED TIME IS");

      if (elapsedTime > TARGET_SESSION_DURATION) {
        setWritingSession({
          ...writingSession,
          status: "completed",
          is_anky: true,
        } as WritingSession);
        const new_user_ankys = await updateAllUserWrittenAnkysOnLocalStorage(
          writingSession?.session_id!
        );
        prettyLog(new_user_ankys, "THE NEW USER ANKYS ARE");
      }
      const newConversation = [...conversationWithAnky, sessionLongString];
      setConversationWithAnky(newConversation);
      const anky_new_prompt = await sendWritingConversationToAnky(
        newConversation
      );
      console.log("setting the async storage with the new prompt");
      AsyncStorage.setItem("upcoming_prompt", anky_new_prompt);
      setChangeBackgroundColor(true);
    } catch (error) {
      console.error("Error in handleSessionEnded:", error);
      throw error;
    }
  };

  const processKeystrokeQueue = async () => {
    if (processingRef.current || keystrokeQueue.current.length === 0) {
      return;
    }

    processingRef.current = true;

    const keystroke = keystrokeQueue.current.shift();
    if (keystroke && keystroke.key && keystroke.delta) {
      setSessionLongString((prev) => {
        const newString =
          prev +
          "\n" +
          keystroke.key +
          " " +
          (keystroke?.delta! / 1000).toFixed(3);
        updateWritingSessionOnLocalStorageSimple(writingSessionId, newString);
        return newString;
      });
    }

    processingRef.current = false;

    if (keystrokeQueue.current.length > 0) {
      processKeystrokeQueue();
    }
  };

  const handleKeyPress = (e: any) => {
    const currentTime = Date.now();
    setTimeSinceLastKeystroke(0);
    keystrokeQueue.current.push({
      key: e.nativeEvent.key,
      delta: currentTime - (lastKeystrokeTime.current ?? 0),
    });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleSessionEnded, TIMEOUT_DURATION);

    lastKeystrokeTime.current = currentTime;

    processKeystrokeQueue();
  };

  async function openWritingGameInSessionModal(elapsedTime: number) {
    prettyLog(elapsedTime, "THE ELAPSED TIME (in seconds) IS");
  }

  const resetAllWritingGameState = () => {
    setText("");
    setSessionLongString("");
    setAnkyPromptStreaming("");
    setNewAnkyPrompt(null);
    setKeystrokes("");
    setAnkyResponseReady(false);
    setTimeSinceLastKeystroke(0);
    setWritingSession(null);
    lastKeystrokeTime.current = null;
    sessionStartTime.current = null;
    timeoutRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, []);

  const renderContent = () => {
    if (preparingWritingSession) {
      return (
        <TouchableWithoutFeedback onPress={handleScreenTap}>
          <View className="flex-1 items-center justify-center px-20 pb-[100px] android:pb-20">
            <Animated.Text className="text-white text-3xl font-righteous text-center">
              {ankyPromptStreaming.split("").map((letter, index) => (
                <Animated.Text key={index} className="text-white">
                  {letter}
                </Animated.Text>
              ))}
            </Animated.Text>
          </View>
        </TouchableWithoutFeedback>
      );
    }
    switch (writingSession?.status) {
      case "writing":
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            className="relative"
          >
            {writingSession.status === "writing" && (
              <WritingProgressBar
                timeSinceLastKeystroke={timeSinceLastKeystroke}
                elapsedTime={new Date().getTime() - sessionStartTime.current!}
              />
            )}
            <TextInput
              autoCorrect={false}
              ref={textInputRef}
              className={`flex-1 w-full text-2xl text-white font-righteous p-2 ${
                changeBackgroundColor ? `bg-green-400 ` : "bg-transparent"
              }`}
              style={{
                textAlignVertical: "top",
                maxHeight: height - keyboardHeight - 100,
              }}
              value={text}
              onChangeText={setText}
              onKeyPress={handleKeyPress}
              multiline
              autoFocus
              autoCapitalize="none"
              selectionColor="#000"
              keyboardAppearance="dark"
            />
            {isWritingSessionModalOpen && (
              <WritingGameModal
                isVisible={isWritingSessionModalOpen}
                session_long_string={sessionLongString}
                onClose={() => setIsWritingSessionModalOpen(false)}
              />
            )}
          </KeyboardAvoidingView>
        );

      case "completed":
        return (
          <SessionEndScreen
            session_id={writingSessionId}
            session_long_string={sessionLongString}
            onNextStep={async () => {
              if (writingSession.is_anky) {
                const ankyverseDay = getCurrentAnkyverseDay();
                AsyncStorage.setItem(
                  "last_user_wrote",
                  `S${ankyverseDay.currentSojourn}W${ankyverseDay.wink}`
                );
              }
              resetAllWritingGameState();
              setPreparingWritingSession(true);
              setWritingSession(null);
            }}
          />
        );
    }
  };
  if (!ankyUser) {
    return (
      <View className="flex-1 bg-black">
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-black">{renderContent()}</SafeAreaView>
  );
};

export default WritingGame;
