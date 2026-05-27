import { Pressable } from "../src/components/ui/Pressable";
import { SERIF, SERIF_ITALIC } from "../src/constants/fonts";
import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Colors } from "../src/constants/colors";
import { supabase } from "../src/lib/supabase";
import { useAuthStore } from "../src/store/auth.store";
import { useDeleteLetter } from "../src/hooks/useLetters";
import { useAudioPlayer } from "../src/hooks/useAudioPlayer";

function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function LetterScreen() {
  const router = useRouter();
  const { letterId } = useLocalSearchParams<{ letterId?: string }>();
  const user = useAuthStore((s) => s.user);
  const deleteLetter = useDeleteLetter();

  const waxScale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  const { data: letter, isLoading } = useQuery({
    queryKey: ["letter", letterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("letters")
        .select("*")
        .eq("id", letterId!)
        .eq("author_id", user?.id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!letterId,
    refetchInterval: (q) => {
      const d = q.state.data as any;
      return d?.transcript_status === "pending" ? 10000 : false;
    },
  });

  // voice-memos is a private bucket, so we need a short-lived signed URL.
  const { data: signedAudioUrl } = useQuery({
    queryKey: ["letter-audio", letter?.media_url],
    queryFn: async () => {
      if (!letter?.media_url) return null;
      const { data, error } = await supabase.storage
        .from("voice-memos")
        .createSignedUrl(letter.media_url, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!letter?.media_url,
  });

  const audio = useAudioPlayer(signedAudioUrl ?? null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.spring(waxScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start();
    }, 350);
  }, []);

  if (!letterId) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5E9D6", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontFamily: SERIF, fontSize: 16, color: Colors.inkSoft }}>No letter selected</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5E9D6" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!letter) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5E9D6", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontFamily: SERIF, fontSize: 16, color: Colors.inkSoft }}>Letter not found</Text>
      </View>
    );
  }

  // Delivery status pill
  let statusText: string;
  let dotColor: string;
  if (!letter.delivered_at && letter.deliver_at) {
    const formatted = new Date(letter.deliver_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    statusText = `Sealed · Opens ${formatted}`;
    dotColor = Colors.amber;
  } else if (letter.delivered_at) {
    const formatted = new Date(letter.delivered_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    statusText = `Delivered · ${formatted}`;
    dotColor = "#8BAE72";
  } else {
    statusText = "Draft";
    dotColor = Colors.inkMuted;
  }

  // Metadata
  const recipientName = letter.recipient_name ?? "Family";
  const opensWhen = letter.deliver_at
    ? new Date(letter.deliver_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Whenever the time is right";
  const certNumber = "HL-" + letter.id.slice(0, 8).toUpperCase();
  const signedDate = letter.created_at
    ? new Date(letter.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  const authorName = user?.name ?? "Author";
  const waxInitial = authorName.charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: "#F5E9D6" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(45,36,26,0.08)" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginRight: 12, padding: 4 })}
          >
            <Feather name="x" size={20} color={Colors.inkSoft} />
          </Pressable>
          <Text style={{ flex: 1, fontSize: 15, fontFamily: SERIF, fontWeight: "600", color: Colors.ink }}>{letter.title}</Text>
          <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}>
            <Feather name="share-2" size={18} color={Colors.inkSoft} />
          </Pressable>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity, transform: [{ translateY: slideY }] }}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        >
          {/* Delivery status pill */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, backgroundColor: "rgba(210,127,20,0.1)", borderRadius: 12, padding: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
            <Text style={{ fontSize: 12, color: "#7A4820", fontWeight: "500", flex: 1 }}>{statusText}</Text>
            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ fontSize: 11, color: Colors.amber, fontWeight: "600" }}>Edit →</Text>
            </Pressable>
          </View>

          {/* Parchment document */}
          <View
            style={{
              backgroundColor: Colors.parchment,
              borderRadius: 6,
              padding: 24,
              paddingLeft: 32,
              borderWidth: 1,
              borderColor: "rgba(169,95,10,0.15)",
              shadowColor: "#4A2F18",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 6,
              overflow: "hidden",
            }}
          >
            {/* Left binding lines */}
            <View style={{ position: "absolute", left: 18, top: 12, bottom: 12, width: 1, backgroundColor: "rgba(169,95,10,0.3)" }} />
            <View style={{ position: "absolute", left: 14, top: 12, bottom: 12, width: 1, backgroundColor: "rgba(169,95,10,0.15)" }} />

            {/* Wax seal */}
            <Animated.View
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "#8A3A0E",
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: waxScale }, { rotate: "-12deg" }],
                shadowColor: "#5E240A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.55,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontWeight: "700", fontSize: 24, color: "#F3C896" }}>{waxInitial}</Text>
            </Animated.View>

            {/* Document header */}
            <View style={{ alignItems: "center", marginBottom: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "rgba(169,95,10,0.1)", paddingRight: 60 }}>
              <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(74,47,24,0.5)", marginBottom: 4 }}>
                A Future Letter
              </Text>
              <Text style={{ fontFamily: SERIF_ITALIC, fontSize: 11, color: "rgba(74,47,24,0.65)", fontStyle: "italic" }}>
                from{" "}
                <Text style={{ fontSize: 16, fontStyle: "normal", fontWeight: "600", color: "#4A2F18" }}>{authorName}</Text>
              </Text>
            </View>

            {/* Letter body */}
            <Text style={{ fontFamily: SERIF, fontWeight: "600", fontSize: 11, color: "#4A2F18", marginBottom: 12 }}>
              To {recipientName}
            </Text>

            <Text style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 23, color: "#2B2118", fontWeight: "500", marginBottom: 20 }}>
              {letter.body ?? "(No content)"}
            </Text>

            {/* Audio player — only if this letter has a recording */}
            {letter.media_url ? (
              <View
                style={{
                  marginBottom: 20,
                  padding: 14,
                  backgroundColor: "rgba(74,47,24,0.05)",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(74,47,24,0.12)",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={() => (audio.isPlaying ? audio.pause() : audio.play())}
                  disabled={!signedAudioUrl}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#8A3A0E",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: !signedAudioUrl ? 0.4 : pressed ? 0.8 : 1,
                  })}
                >
                  <Feather
                    name={audio.isPlaying ? "pause" : "play"}
                    size={18}
                    color="#F3C896"
                    style={!audio.isPlaying ? { marginLeft: 2 } : undefined}
                  />
                </Pressable>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: SERIF_ITALIC,
                      fontStyle: "italic",
                      fontSize: 11,
                      color: "rgba(74,47,24,0.6)",
                      marginBottom: 6,
                    }}
                  >
                    {signedAudioUrl
                      ? audio.isPlaying
                        ? "Playing your voice"
                        : "Your voice, recorded"
                      : "Loading audio…"}
                  </Text>
                  <View
                    style={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "rgba(74,47,24,0.12)",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(100, Math.max(0, audio.progress * 100))}%`,
                        height: "100%",
                        backgroundColor: "#8A3A0E",
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 10.5,
                      color: "rgba(74,47,24,0.55)",
                      marginTop: 6,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {formatMs(audio.positionMs)} / {formatMs(audio.durationMs)}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Transcript */}
            <TranscriptBlock letter={letter} />

            {/* Sign line */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(169,95,10,0.15)" }}>
              <View style={{ flex: 1, height: 1, backgroundColor: "rgba(74,47,24,0.25)" }} />
              <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: 8.5, letterSpacing: 1.2, color: "rgba(74,47,24,0.45)", textTransform: "uppercase" }}>
                {signedDate ? `Signed & sealed · ${signedDate}` : "Signed & sealed"}
              </Text>
            </View>
          </View>

          {/* Metadata rows */}
          <View style={{ marginTop: 18, backgroundColor: Colors.white, borderRadius: 14, overflow: "hidden", shadowColor: Colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            {([
              ["Recipient", recipientName],
              ["Opens when", opensWhen],
              ["Delivery", "Push notification + email"],
              ["Certificate", certNumber],
            ] as [string, string][]).map(([label, value], i, arr) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 13,
                  paddingHorizontal: 16,
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: "rgba(45,36,26,0.06)",
                }}
              >
                <Text style={{ fontSize: 12.5, color: Colors.inkMuted }}>{label}</Text>
                <Text style={{ fontSize: 12.5, fontWeight: "500", color: Colors.inkSoft, maxWidth: "60%", textAlign: "right" }}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={{ marginTop: 18, gap: 10 }}>
            <Pressable
              onPress={() => router.push({ pathname: "/record", params: { editLetterId: letter.id } } as any)}
              style={({ pressed }) => ({
                backgroundColor: "#4A2F18",
                borderRadius: 13,
                paddingVertical: 15,
                alignItems: "center",
                opacity: pressed ? 0.88 : 1,
                shadowColor: "#4A2F18",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 4,
              })}
            >
              <Text style={{ fontSize: 14.5, fontWeight: "600", color: "#FBF2DD" }}>Edit Letter</Text>
            </Pressable>
            <Pressable
              disabled={deleteLetter.isPending}
              onPress={() => {
                Alert.alert(
                  "Delete this letter?",
                  "This can't be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        deleteLetter.mutate(
                          { id: letter.id, mediaUrl: (letter as any).media_url ?? null },
                          { onSuccess: () => router.back() },
                        );
                      },
                    },
                  ],
                );
              }}
              style={({ pressed }) => ({
                borderRadius: 13,
                paddingVertical: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(168,42,42,0.25)",
                opacity: deleteLetter.isPending ? 0.5 : pressed ? 0.7 : 1,
                flexDirection: "row",
                justifyContent: "center",
                gap: 7,
              })}
            >
              <Feather name="trash-2" size={13} color="#A82A2A" />
              <Text style={{ fontSize: 13, color: "#A82A2A" }}>
                {deleteLetter.isPending ? "Deleting…" : "Delete letter"}
              </Text>
            </Pressable>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TranscriptBlock({ letter }: { letter: any }) {
  const [expanded, setExpanded] = useState(false);
  const status = letter.transcript_status as string | null;
  const transcript = letter.transcript as string | null;

  if (!letter.media_url) return null;

  if (status === "pending" || (status === null && letter.media_url)) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          padding: 12,
          backgroundColor: "rgba(74,47,24,0.04)",
          borderRadius: 10,
        }}
      >
        <ActivityIndicator size="small" color="rgba(74,47,24,0.4)" />
        <Text
          style={{
            fontFamily: SERIF_ITALIC,
            fontStyle: "italic",
            fontSize: 12.5,
            color: "rgba(74,47,24,0.5)",
          }}
        >
          Transcribing… we'll save the words shortly.
        </Text>
      </View>
    );
  }

  if (status === "done" && transcript) {
    const truncated = transcript.length > 280 && !expanded;
    return (
      <View
        style={{
          marginBottom: 16,
          padding: 14,
          backgroundColor: "rgba(74,47,24,0.04)",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "rgba(169,95,10,0.12)",
        }}
      >
        <Text
          style={{
            fontSize: 9.5,
            fontWeight: "700",
            letterSpacing: 1.8,
            textTransform: "uppercase",
            color: "rgba(74,47,24,0.45)",
            marginBottom: 8,
          }}
        >
          Transcript
        </Text>
        <Text
          style={{
            fontFamily: SERIF,
            fontSize: 14,
            color: "rgba(74,47,24,0.75)",
            lineHeight: 22,
          }}
        >
          {truncated ? transcript.slice(0, 280) + "…" : transcript}
        </Text>
        {transcript.length > 280 && (
          <Pressable
            onPress={() => setExpanded(!expanded)}
            style={({ pressed }) => ({
              marginTop: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: Colors.amberDeep,
              }}
            >
              {expanded ? "Show less" : "Read more"}
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (status === "failed") {
    return (
      <View style={{ marginBottom: 16, paddingHorizontal: 4 }}>
        <Text
          style={{
            fontFamily: SERIF_ITALIC,
            fontStyle: "italic",
            fontSize: 12,
            color: "rgba(74,47,24,0.4)",
          }}
        >
          We couldn't transcribe this one — the audio still plays fine.
        </Text>
      </View>
    );
  }

  return null;
}
