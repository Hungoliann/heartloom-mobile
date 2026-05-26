import { Pressable } from "../../src/components/ui/Pressable";
import { SERIF, SERIF_ITALIC } from "../../src/constants/fonts";
import { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useLetters, useDeleteLetter } from "../../src/hooks/useLetters";

const LETTER_COLORS = ["#D27F14", "#6F8564", "#B86241", "#4A3D2E", "#8A7A66"];
const LETTER_EMOJIS = ["✉", "★", "♡", "✦", "◆"];

export default function LegacyScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const { data: letters = [], isLoading } = useLetters();
  const deleteLetter = useDeleteLetter();

  const confirmDelete = (id: string, mediaUrl: string | null) => {
    Alert.alert(
      "Delete this letter?",
      "This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteLetter.mutate({ id, mediaUrl }),
        },
      ],
    );
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const sealed = letters.filter((l) => !l.delivered_at && l.deliver_at).length;
  const delivered = letters.filter((l) => !!l.delivered_at).length;

  const mappedLetters = letters.map((l, i) => ({
    id: l.id,
    mediaUrl: (l as any).media_url ?? null,
    for: l.recipient_name ?? "Family",
    title: l.title,
    status: l.delivered_at ? "delivered" : "sealed",
    deliverLabel: l.deliver_at
      ? new Date(l.deliver_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : l.delivered_at
      ? "Delivered"
      : "Draft",
    preview: l.body?.slice(0, 100) ?? "",
    color: LETTER_COLORS[i % LETTER_COLORS.length],
    emoji: LETTER_EMOJIS[i % LETTER_EMOJIS.length],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF6EE" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
            <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8C7B65", marginBottom: 6 }}>
              Your archive
            </Text>
            <Text style={{ fontFamily: SERIF, fontSize: 28, color: "#2C1F0E", lineHeight: 34 }}>
              Future Letters
            </Text>
            <Text style={{ fontSize: 14, color: "#8C7B65", marginTop: 6 }}>
              {sealed} sealed · {delivered} delivered
            </Text>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: "row", marginHorizontal: 20, gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total", value: letters.length.toString(), color: "#2C1F0E" },
              { label: "Sealed", value: sealed.toString(), color: "#D4A853" },
              { label: "Delivered", value: delivered.toString(), color: "#8BAE72" },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#EDE4D4" }}
              >
                <Text style={{ fontFamily: SERIF, fontSize: 22, color: stat.color, fontWeight: "600" }}>{stat.value}</Text>
                <Text style={{ fontSize: 11, color: "#8C7B65", marginTop: 2, letterSpacing: 0.5 }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Letters list */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 100 }}>
            {/* Loading skeletons */}
            {isLoading && [1, 2, 3].map((i) => (
              <View
                key={i}
                style={{ height: 140, borderRadius: 20, backgroundColor: "rgba(45,36,26,0.06)", marginBottom: 14 }}
              />
            ))}

            {/* Empty state */}
            {!isLoading && letters.length === 0 && (
              <View style={{ alignItems: "center", paddingVertical: 48, gap: 12 }}>
                <Text style={{ fontSize: 32 }}>✉</Text>
                <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: 20, color: "#2C1F0E", textAlign: "center" }}>
                  No letters yet.
                </Text>
                <Text style={{ fontSize: 14, color: "#8C7B65", textAlign: "center", paddingHorizontal: 32 }}>
                  Write something for someone you love — they'll receive it when the time is right.
                </Text>
                <Pressable
                  onPress={() => router.push("/record")}
                  style={({ pressed }) => ({
                    marginTop: 8,
                    backgroundColor: "#D27F14",
                    borderRadius: 14,
                    paddingVertical: 13,
                    paddingHorizontal: 28,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600" }}>Write your first letter →</Text>
                </Pressable>
              </View>
            )}

            {/* Letter cards */}
            {!isLoading && mappedLetters.map((letter) => {
              const isDeleting = deleteLetter.isPending && deleteLetter.variables?.id === letter.id;
              return (
              <Animated.View
                key={letter.id}
                style={{ opacity, transform: [{ translateY }] }}
              >
                <Pressable
                  onPress={() => router.push({ pathname: "/letter", params: { letterId: letter.id } })}
                  onLongPress={() => confirmDelete(letter.id, letter.mediaUrl)}
                  disabled={isDeleting}
                  style={({ pressed }) => ({
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 1.5,
                    borderColor: "#EDE4D4",
                    opacity: isDeleting ? 0.4 : pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    shadowColor: "#2C1F0E",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.07,
                    shadowRadius: 10,
                    elevation: 3,
                  })}
                >
                  {/* Card header */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: letter.color + "22", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 20 }}>{letter.emoji}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 12, color: "#8C7B65" }}>For</Text>
                        <Text style={{ fontSize: 15, color: "#2C1F0E", fontWeight: "600" }}>{letter.for}</Text>
                      </View>
                    </View>

                    <View style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: letter.status === "delivered" ? "#8BAE7222" : "#D4A85322",
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: "600", color: letter.status === "delivered" ? "#5C7A45" : "#B8863C" }}>
                        {letter.status === "delivered" ? "✓ Delivered" : "🔒 Sealed"}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text style={{ fontFamily: SERIF_ITALIC, fontStyle: "italic", fontSize: 17, color: "#2C1F0E", lineHeight: 24, marginBottom: 8 }}>
                    "{letter.title}"
                  </Text>

                  {/* Preview */}
                  <Text style={{ fontSize: 13, color: "#8C7B65", lineHeight: 18, marginBottom: 14 }} numberOfLines={2}>
                    {letter.preview}
                  </Text>

                  {/* Footer */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F5EDD6", paddingTop: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Feather name={letter.status === "delivered" ? "check-circle" : "clock"} size={13} color={letter.status === "delivered" ? "#8BAE72" : "#D4A853"} />
                      <Text style={{ fontSize: 12, color: "#8C7B65" }}>{letter.deliverLabel}</Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Compose FAB */}
        <Pressable
          onPress={() => router.push("/record")}
          style={({ pressed }) => ({
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: "#D4A853",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.92 : 1 }],
            shadowColor: "#D4A853",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 14,
            elevation: 8,
          })}
        >
          <Feather name="plus" size={26} color="#FFFFFF" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
