import { View, Text, Modal } from "react-native";
import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";

const QUICK_EMOJIS = ["❤️", "👍", "😂", "😢", "🙏", "🔥"];

type Props = {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onDismiss: () => void;
};

export function ReactionPicker({ visible, onSelect, onDismiss }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        onPress={onDismiss}
        style={{
          flex: 1,
          backgroundColor: "rgba(45,36,26,0.32)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: Colors.parchment,
            borderRadius: 28,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: "rgba(184,132,60,0.30)",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => onSelect(emoji)}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed
                  ? "rgba(210,127,20,0.18)"
                  : "transparent",
                transform: [{ scale: pressed ? 1.1 : 1 }],
              })}
            >
              <Text style={{ fontSize: 26 }}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
