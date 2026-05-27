import { View, Text, ScrollView, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";
import type { MessageWithProfile } from "../../hooks/useMessages";

type Props = {
  pinned: MessageWithProfile[];
  onTap: (msgId: string) => void;
  onUnpin: (msgId: string) => void;
};

function previewOf(msg: MessageWithProfile): string {
  const mediaType =
    (msg as any).media_type ?? (msg as any).message_type ?? "text";
  if (mediaType === "voice") return "Voice message";
  if (mediaType === "shared_letter") return "Shared letter";
  if (mediaType === "image") return "Photo";
  return (msg.body ?? "").trim() || "Message";
}

export function PinnedStrip({ pinned, onTap, onUnpin }: Props) {
  if (pinned.length === 0) return null;

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: Colors.rule,
        backgroundColor: "rgba(210,127,20,0.06)",
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 8,
        }}
      >
        {pinned.map((m) => {
          const author = m.profiles?.full_name ?? "Family";
          return (
            <Pressable
              key={m.id}
              onPress={() => onTap(m.id)}
              onLongPress={() =>
                Alert.alert(
                  "Unpin this message?",
                  "It will no longer appear in the pinned strip.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Unpin",
                      style: "destructive",
                      onPress: () => onUnpin(m.id),
                    },
                  ]
                )
              }
              delayLongPress={350}
              style={({ pressed }) => ({
                maxWidth: 220,
                backgroundColor: pressed
                  ? "rgba(184,132,60,0.18)"
                  : "rgba(255,250,232,0.92)",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "rgba(184,132,60,0.30)",
                paddingHorizontal: 10,
                paddingVertical: 6,
              })}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 2,
                }}
              >
                <Feather name="bookmark" size={10} color={Colors.amberDeep} />
                <Text
                  style={{
                    fontSize: 9.5,
                    fontWeight: "700",
                    color: Colors.amberDeep,
                    letterSpacing: 0.4,
                  }}
                >
                  PINNED · {author}
                </Text>
              </View>
              <Text
                style={{ fontSize: 12, color: Colors.ink, lineHeight: 16 }}
                numberOfLines={1}
              >
                {previewOf(m)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
