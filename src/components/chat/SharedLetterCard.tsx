import { View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";
import { SERIF, SERIF_ITALIC } from "../../constants/fonts";
import { supabase } from "../../lib/supabase";

type Props = {
  letterId: string;
  onOpen: () => void;
  isOut?: boolean;
};

export function SharedLetterCard({ letterId, onOpen, isOut }: Props) {
  const { data: letter } = useQuery({
    queryKey: ["letter-card", letterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("letters")
        .select("id, recipient_name, body, title")
        .eq("id", letterId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const recipient = letter?.recipient_name ?? letter?.title ?? "A letter";
  const bodySnippet = (letter?.body ?? "").trim().slice(0, 60);
  const moreToRead = (letter?.body?.length ?? 0) > 60;

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => ({
        backgroundColor: Colors.parchment,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isOut ? "rgba(251,244,224,0.55)" : "rgba(184,132,60,0.28)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        opacity: pressed ? 0.85 : 1,
        minWidth: 200,
        maxWidth: 260,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <Feather name="mail" size={12} color={Colors.amberDeep} />
        <Text
          style={{
            fontSize: 10.5,
            fontWeight: "700",
            color: Colors.amberDeep,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          Future Letter
        </Text>
      </View>

      <Text
        style={{
          fontFamily: SERIF,
          fontSize: 14,
          color: Colors.ink,
          marginBottom: 4,
        }}
        numberOfLines={1}
      >
        To {recipient}
      </Text>

      {bodySnippet ? (
        <Text
          style={{
            fontFamily: SERIF_ITALIC,
            fontStyle: "italic",
            fontSize: 12.5,
            color: Colors.inkSoft,
            lineHeight: 17,
          }}
          numberOfLines={2}
        >
          "{bodySnippet}
          {moreToRead ? "…" : ""}"
        </Text>
      ) : null}

      <Text
        style={{
          fontSize: 11,
          color: Colors.amberDeep,
          marginTop: 6,
          fontWeight: "600",
        }}
      >
        Tap to open →
      </Text>
    </Pressable>
  );
}
