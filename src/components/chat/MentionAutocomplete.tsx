import { useMemo } from "react";
import { View, Text } from "react-native";

import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";
import { useFamily } from "../../hooks/useFamily";

type Member = { id: string; full_name: string };

type Props = {
  visible: boolean;
  query: string;
  onPick: (member: Member) => void;
};

function initialOf(name: string | null | undefined) {
  if (!name) return "?";
  const c = name.trim()[0];
  return c ? c.toUpperCase() : "?";
}

export function MentionAutocomplete({ visible, query, onPick }: Props) {
  const { data: members } = useFamily();

  const matches = useMemo<Member[]>(() => {
    if (!members) return [];
    const q = query.toLowerCase();
    return members
      .filter((m) => !!m.full_name)
      .filter((m) =>
        q.length === 0 ? true : (m.full_name as string).toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((m) => ({ id: m.id, full_name: m.full_name as string }));
  }, [members, query]);

  if (!visible || matches.length === 0) return null;

  return (
    <View
      style={{
        marginHorizontal: 14,
        marginBottom: 6,
        backgroundColor: Colors.bg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(184,132,60,0.30)",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      {matches.map((m, i) => (
        <Pressable
          key={m.id}
          onPress={() => onPick(m)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: "rgba(184,132,60,0.12)",
            backgroundColor: pressed
              ? "rgba(184,132,60,0.10)"
              : "transparent",
          })}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: Colors.amber,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ color: Colors.white, fontWeight: "700", fontSize: 10 }}
            >
              {initialOf(m.full_name)}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: Colors.ink }}>{m.full_name}</Text>
        </Pressable>
      ))}
    </View>
  );
}
