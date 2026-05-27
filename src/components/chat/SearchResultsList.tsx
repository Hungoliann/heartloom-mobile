import { View, Text, FlatList, ActivityIndicator } from "react-native";

import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";
import { SERIF_ITALIC } from "../../constants/fonts";
import type { MessageWithProfile } from "../../hooks/useMessages";

type Props = {
  results: MessageWithProfile[];
  query: string;
  onPick: (messageId: string) => void;
  isLoading: boolean;
};

function initialOf(name: string | null | undefined) {
  if (!name) return "?";
  const c = name.trim()[0];
  return c ? c.toUpperCase() : "?";
}

/** Splits a body into segments highlighting case-insensitive matches of `query`. */
function highlight(body: string, query: string) {
  const q = query.trim();
  if (!q) return [{ text: body, hit: false }];
  const lower = body.toLowerCase();
  const lowerQ = q.toLowerCase();
  const out: { text: string; hit: boolean }[] = [];
  let i = 0;
  while (i < body.length) {
    const idx = lower.indexOf(lowerQ, i);
    if (idx === -1) {
      out.push({ text: body.slice(i), hit: false });
      break;
    }
    if (idx > i) out.push({ text: body.slice(i, idx), hit: false });
    out.push({ text: body.slice(idx, idx + q.length), hit: true });
    i = idx + q.length;
  }
  return out;
}

export function SearchResultsList({ results, query, onPick, isLoading }: Props) {
  if (isLoading && results.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.bg,
        }}
      >
        <ActivityIndicator color={Colors.amberDeep} />
      </View>
    );
  }
  if (!isLoading && results.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          backgroundColor: Colors.bg,
        }}
      >
        <Text
          style={{
            fontFamily: SERIF_ITALIC,
            fontStyle: "italic",
            fontSize: 14,
            color: Colors.inkMuted,
            textAlign: "center",
          }}
        >
          No messages match "{query}".
        </Text>
      </View>
    );
  }
  return (
    <FlatList
      style={{ flex: 1, backgroundColor: Colors.bg }}
      data={results}
      keyExtractor={(m) => m.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingVertical: 6 }}
      renderItem={({ item }) => {
        const author = item.profiles?.full_name ?? "Family";
        const segments = highlight(item.body ?? "", query);
        return (
          <Pressable
            onPress={() => onPick(item.id)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: pressed
                ? "rgba(184,132,60,0.08)"
                : "transparent",
            })}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: Colors.amber,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: Colors.white, fontWeight: "700", fontSize: 11 }}
              >
                {initialOf(author)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: Colors.amberDeep,
                  letterSpacing: 0.3,
                }}
                numberOfLines={1}
              >
                {author}
              </Text>
              <Text
                style={{
                  fontSize: 13.5,
                  color: Colors.ink,
                  marginTop: 2,
                  lineHeight: 19,
                }}
                numberOfLines={2}
              >
                {segments.map((s, idx) => (
                  <Text
                    key={idx}
                    style={s.hit ? { fontWeight: "700" } : undefined}
                  >
                    {s.text}
                  </Text>
                ))}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}
