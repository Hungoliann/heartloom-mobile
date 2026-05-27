import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";
import type { MessageWithProfile } from "../../hooks/useMessages";

type Props = {
  message: MessageWithProfile;
  onClear?: () => void;
  /** Render in a compact way inside a sent bubble (no background fill). */
  inBubble?: boolean;
  isOut?: boolean;
};

function previewText(message: MessageWithProfile): string {
  const mediaType =
    (message as any).media_type ?? (message as any).message_type;
  if (mediaType === "voice") return "Voice message";
  if (mediaType === "shared_letter") return "Shared letter";
  return (message.body ?? "").trim() || "Message";
}

export function ReplyPreview({ message, onClear, inBubble, isOut }: Props) {
  const author = message.profiles?.full_name ?? "Family";
  const preview = previewText(message);

  const tint = inBubble && isOut ? Colors.cream : Colors.inkSoft;
  const accent = inBubble && isOut ? Colors.cream : Colors.amberDeep;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingLeft: 8,
        paddingRight: onClear ? 4 : 8,
        paddingVertical: inBubble ? 4 : 8,
        borderLeftWidth: 3,
        borderLeftColor: accent,
        backgroundColor: inBubble
          ? "transparent"
          : "rgba(184,132,60,0.10)",
        borderRadius: inBubble ? 0 : 8,
        marginBottom: inBubble ? 6 : 0,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 10.5,
            fontWeight: "700",
            color: accent,
            letterSpacing: 0.3,
          }}
          numberOfLines={1}
        >
          Replying to {author}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: tint,
            marginTop: 2,
            lineHeight: 16,
          }}
          numberOfLines={2}
        >
          {preview}
        </Text>
      </View>

      {onClear ? (
        <Pressable
          onPress={onClear}
          style={({ pressed }) => ({
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed
              ? "rgba(184,132,60,0.16)"
              : "transparent",
          })}
        >
          <Feather name="x" size={14} color={Colors.inkSoft} />
        </Pressable>
      ) : null}
    </View>
  );
}
