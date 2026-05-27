import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";

import { Colors } from "../../constants/colors";
import { SERIF_ITALIC } from "../../constants/fonts";

function firstName(full: string | null | undefined) {
  if (!full) return "Someone";
  return full.trim().split(/\s+/)[0] || "Someone";
}

function buildLabel(users: { full_name: string }[]): string {
  if (users.length === 0) return "";
  const names = users.map((u) => firstName(u.full_name));
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return `${names[0]} and ${names.length - 1} others are typing`;
}

function Dot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, delay]);

  return (
    <Animated.View
      style={{
        opacity,
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1.5,
        backgroundColor: Colors.inkMuted,
      }}
    />
  );
}

export function TypingIndicator({
  users,
}: {
  users: { full_name: string }[];
}) {
  if (users.length === 0) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 18,
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          fontFamily: SERIF_ITALIC,
          fontStyle: "italic",
          fontSize: 12,
          color: Colors.inkMuted,
        }}
      >
        {buildLabel(users)}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}
