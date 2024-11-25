import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";

interface ModalWrapperProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationDuration?: number;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isVisible,
  onClose,
  children,
  animationDuration = 200,
}) => {
  const [showModal, setShowModal] = React.useState(isVisible);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      setShowModal(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [isVisible, fadeAnim]);

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      onRequestClose={onClose}
      animationType="none"
    >
      <BlurView intensity={20} style={styles.backdrop}>
        <TouchableOpacity
          style={styles.touchableBackdrop}
          onPress={onClose}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} style={styles.content}>
              {children}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  touchableBackdrop: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "90%",
    maxWidth: 400,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
