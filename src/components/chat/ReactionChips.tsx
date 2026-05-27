import { View, Text } from "react-native";
import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";
import type { MessageReaction } from "../../hooks/useMessages";

type Props = {
  reactions: MessageReaction[];
  currentUserId: string;
  onToggle: (emoji: string) => void;
};

export function ReactionChips({ reactions, currentUserId, onToggle }: Props) {
  if (!reactions || reactions.length === 0) return null;

  // Group by emoji.
  const groups = new Map<string, { count: number; mine: boolean }>();
  for (const r of reactions) {
    const g = groups.get(r.emoji) ?? { count: 0, mine: false };
    g.count += 1;
    if (r.user_id === currentUserId) g.mine = true;
    groups.set(r.emoji, g);
  }

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 4,
      }}
    >
      {Array.from(groups.entries()).map(([emoji, { count, mine }]) => (
        <Pressable
          key={emoji}
          onPress={() => onToggle(emoji)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 12,
            backgroundColor: mine
              ? "rgba(210,127,20,0.18)"
              : "rgba(255,250,232,0.92)",
            borderWidth: 1,
            borderColor: mine
              ? Colors.amber
              : "rgba(184,132,60,0.22)",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 12 }}>{emoji}</Text>
          <Text
            style={{
              fontSize: 11,
              color: mine ? Colors.amberDeep : Colors.inkSoft,
              fontWeight: "600",
            }}
          >
            {count}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
