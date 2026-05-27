import { useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";

import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";

/**
 * Per-bubble signed URL for a chat image. We cache for ~50 minutes (signed URL
 * is good for an hour) — same pattern as `useSignedAudioUrl` in chat.tsx.
 */
function useSignedImageUrl(mediaUrl: string | null | undefined) {
  return useQuery({
    queryKey: ["chat-image", mediaUrl],
    queryFn: async () => {
      if (!mediaUrl) return null;
      const { data, error } = await supabase.storage
        .from("chat-images")
        .createSignedUrl(mediaUrl, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!mediaUrl && !mediaUrl.startsWith("file:") && !mediaUrl.startsWith("ph:") && !mediaUrl.startsWith("content:"),
    staleTime: 50 * 60 * 1000,
  });
}

export function ImageMessageBubble({
  mediaUrl,
  onOpen,
}: {
  mediaUrl: string | null | undefined;
  onOpen: (resolvedUrl: string) => void;
}) {
  // Local file URIs (optimistic preview) bypass signing.
  const isLocal = useMemo(() => {
    if (!mediaUrl) return false;
    return (
      mediaUrl.startsWith("file:") ||
      mediaUrl.startsWith("ph:") ||
      mediaUrl.startsWith("content:") ||
      mediaUrl.startsWith("data:")
    );
  }, [mediaUrl]);

  const { data: signedUrl, isLoading } = useSignedImageUrl(mediaUrl);
  const displayUrl = isLocal ? mediaUrl ?? null : signedUrl ?? null;

  return (
    <Pressable
      onPress={() => {
        if (displayUrl) onOpen(displayUrl);
      }}
      style={({ pressed }) => ({
        width: 220,
        height: 220,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "rgba(184,132,60,0.10)",
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {displayUrl ? (
        <Image
          source={{ uri: displayUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.amberDeep} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
