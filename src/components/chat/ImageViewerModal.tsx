import { useEffect } from "react";
import { Modal, View, BackHandler, Platform } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { Pressable } from "../ui/Pressable";

export function ImageViewerModal({
  visible,
  mediaUrl,
  onClose,
}: {
  visible: boolean;
  mediaUrl: string | null;
  onClose: () => void;
}) {
  // Android hardware-back support.
  useEffect(() => {
    if (Platform.OS !== "android" || !visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={150}
          />
        ) : null}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            position: "absolute",
            top: Platform.OS === "ios" ? 60 : 48,
            right: 18,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(0,0,0,0.55)",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Feather name="x" size={22} color="white" />
        </Pressable>
      </View>
    </Modal>
  );
}
