import { useRef, useEffect, useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLetters } from "../../src/hooks/useLetters";

const AMBER = "#D27F14";
const AMBER_DEEP = "#B06600";
const INK = "#2D241A";
const INK_SOFT = "#4A3D2E";
const INK_MUTED = "#8A7A66";
const CREAM = "#FAF3E2";
const PAPER = "#FBF4DC";
const SAGE_DEEP = "#6F8564";
const RULE = "rgba(74,47,24,0.14)";

type EntryTag = "SEALED" | "SUGGESTED" | "AUDIO";

type TimelineEntry = {
  id: string;
  date: string;
  dateSub: string;
  title: string;
  sub: string;
  tag?: EntryTag;
  isToday?: boolean;
  isAudio?: boolean;
};

type TimelineSection = {
  year: string;
  entries: TimelineEntry[];
};

const TIMELINE_DATA: TimelineSection[] = [
  {
    year: "2034",
    entries: [
      {
        id: "1",
        date: "JUN 14",
        dateSub: "8 yrs out",
        title: "For Maya, on her 30th",
        sub: "Future Letter · sealed · \"…you are allowed to be tired.\"",
        tag: "SEALED",
      },
      {
        id: "2",
        date: "APR 02",
        dateSub: "milestone",
        title: "Maya's wedding (anticipated)",
        sub: "Suggest: record a toast in advance · 90 sec",
        tag: "SUGGESTED",
      },
    ],
  },
  {
    year: "2028",
    entries: [
      {
        id: "3",
        date: "SEP 09",
        dateSub: "2 yrs out",
        title: "College send-off letter",
        sub: "For Maya · sealed · opens her first dorm morning",
        tag: "SEALED",
      },
    ],
  },
  {
    year: "2026",
    entries: [
      {
        id: "4",
        date: "MAY 13",
        dateSub: "today",
        title: "Voice memory: \"the sound of the screen door\"",
        sub: "1:42 · added to Story Archive",
        tag: "AUDIO",
        isToday: true,
        isAudio: true,
      },
      {
        id: "5",
        date: "MAY 08",
        dateSub: "milestone",
        title: "Mother's Day · brunch at Lila's",
        sub: "Photo added · 4 stories collected",
      },
    ],
  },
];

type Tab = "forward" | "backward" | "all";

function TagPill({ tag }: { tag: EntryTag }) {
  const config: Record<EntryTag, { bg: string; color: string }> = {
    SEALED: { bg: "rgba(210,127,20,0.15)", color: AMBER_DEEP },
    SUGGESTED: { bg: "rgba(111,133,100,0.15)", color: SAGE_DEEP },
    AUDIO: { bg: "rgba(74,61,46,0.1)", color: INK_SOFT },
  };
  const c = config[tag];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: c.bg,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 3,
        marginTop: 6,
      }}
    >
      <Text
        style={{
          fontSize: 9.5,
          fontWeight: "700",
          letterSpacing: 0.8,
          color: c.color,
        }}
      >
        {tag}
      </Text>
    </View>
  );
}

function YearMarker({ year }: { year: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 4,
        marginVertical: 6,
      }}
    >
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 13,
          fontWeight: "700",
          color: INK_SOFT,
          letterSpacing: 0.5,
        }}
      >
        {year}
      </Text>
    </View>
  );
}

function EntryCard({
  entry,
  onPlayPress,
}: {
  entry: TimelineEntry;
  onPlayPress?: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: entry.isToday ? PAPER : "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        borderWidth: entry.isToday ? 1.5 : 1,
        borderColor: entry.isToday ? "rgba(210,127,20,0.35)" : RULE,
        shadowColor: INK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 1,
      }}
    >
      {/* Date */}
      <Text
        style={{
          fontSize: 10.5,
          fontWeight: "700",
          color: INK_MUTED,
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {entry.date}
        {entry.dateSub ? (
          <Text style={{ fontWeight: "400" }}> · {entry.dateSub}</Text>
        ) : null}
      </Text>

      {/* Title */}
      <Text
        style={{
          fontFamily: "Georgia",
          fontSize: 14,
          fontWeight: "600",
          color: INK,
          lineHeight: 20,
          marginBottom: 3,
        }}
      >
        {entry.title}
      </Text>

      {/* Subtitle */}
      {entry.sub ? (
        <Text style={{ fontSize: 11, color: INK_MUTED, lineHeight: 16 }}>
          {entry.sub}
        </Text>
      ) : null}

      {/* Tag or play button */}
      {entry.tag ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TagPill tag={entry.tag} />
          {entry.isAudio && (
            <Pressable
              onPress={onPlayPress}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: AMBER,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1,
                shadowColor: AMBER,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.4,
                shadowRadius: 5,
                elevation: 3,
                marginTop: 6,
              })}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 11, marginLeft: 2 }}>▶</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function TimelineScreen() {
  const router = useRouter();
  const { data: letters = [] } = useLetters();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  const [activeTab, setActiveTab] = useState<Tab>("forward");

  // Merge real letters into timeline sections alongside static suggestions
  const timelineData = useMemo<TimelineSection[]>(() => {
    const realEntries: TimelineEntry[] = letters.map((l) => {
      const dateObj = l.deliver_at ? new Date(l.deliver_at) : new Date(l.created_at);
      const monthDay = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase();
      return {
        id: l.id,
        date: monthDay,
        dateSub: l.deliver_at ? `${dateObj.getFullYear()}` : "draft",
        title: l.title,
        sub: l.recipient_name ? `For ${l.recipient_name}` : (l.body?.slice(0, 60) ?? ""),
        tag: l.deliver_at && !l.delivered_at ? ("SEALED" as const) : undefined,
        isAudio: l.media_type === "audio",
      };
    });

    // Group real entries by year
    const byYear = new Map<string, TimelineEntry[]>();
    for (const e of realEntries) {
      const year = e.dateSub.length === 4 ? e.dateSub : new Date().getFullYear().toString();
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year)!.push(e);
    }

    // If no real letters yet, fall back to static demo data
    if (realEntries.length === 0) return TIMELINE_DATA;

    return Array.from(byYear.entries())
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, entries]) => ({ year, entries }));
  }, [letters]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start();
  }, []);

  const TABS: { key: Tab; label: string }[] = [
    { key: "forward", label: "Forward" },
    { key: "backward", label: "Backward" },
    { key: "all", label: "All" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: CREAM }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: CREAM,
            borderBottomWidth: 1,
            borderBottomColor: RULE,
          }}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: RULE,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
              flexShrink: 0,
            })}
          >
            <Text style={{ fontSize: 20, color: INK_SOFT, lineHeight: 24, marginTop: -1 }}>‹</Text>
          </Pressable>

          {/* Title */}
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 14,
              color: INK_SOFT,
            }}
          >
            Timeline
          </Text>

          {/* Year selector */}
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 1.6,
              color: INK_MUTED,
              minWidth: 48,
              textAlign: "right",
            }}
          >
            2034 →
          </Text>
        </View>

        <Animated.View style={{ flex: 1, opacity, transform: [{ translateY: slideY }] }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* ── Intro ── */}
            <View style={{ paddingHorizontal: 22, paddingTop: 20, marginBottom: 4 }}>
              <Text
                style={{
                  fontFamily: "Georgia",
                  fontWeight: "500",
                  fontSize: 26,
                  lineHeight: 32,
                  letterSpacing: -0.3,
                  color: INK,
                  marginBottom: 8,
                }}
              >
                A life,{"\n"}
                <Text style={{ fontStyle: "italic", color: AMBER_DEEP }}>
                  laid down in seasons.
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: INK_MUTED,
                  lineHeight: 20,
                  marginBottom: 16,
                }}
              >
                Sealed letters, recordings, and milestones — woven into one ribbon. Scroll the years.
              </Text>
            </View>

            {/* ── Tab pills ── */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 22,
                gap: 8,
                marginBottom: 16,
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 999,
                      alignItems: "center",
                      backgroundColor: isActive ? INK : "rgba(74,47,24,0.08)",
                      borderWidth: isActive ? 0 : 1,
                      borderColor: RULE,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: isActive ? CREAM : INK_MUTED,
                        letterSpacing: 0.2,
                      }}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ── Timeline entries ── */}
            {timelineData.map((section) => (
              <View key={section.year}>
                <YearMarker year={section.year} />

                {section.entries.map((entry) => (
                  <View
                    key={entry.id}
                    style={{
                      flexDirection: "row",
                      paddingLeft: 20,
                      paddingRight: 20,
                      marginBottom: 10,
                    }}
                  >
                    {/* Spine + dot column */}
                    <View
                      style={{
                        width: 20,
                        alignItems: "center",
                        marginRight: 10,
                        flexShrink: 0,
                      }}
                    >
                      {/* Vertical line */}
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          width: 2,
                          backgroundColor: "rgba(74,47,24,0.2)",
                          left: 9,
                        }}
                      />
                      {/* Dot */}
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor:
                            entry.tag === "SEALED"
                              ? AMBER
                              : entry.tag === "AUDIO"
                              ? SAGE_DEEP
                              : entry.tag === "SUGGESTED"
                              ? "rgba(111,133,100,0.5)"
                              : "rgba(74,47,24,0.25)",
                          borderWidth: 2,
                          borderColor: CREAM,
                          marginTop: 16,
                          zIndex: 2,
                        }}
                      />
                    </View>

                    {/* Card */}
                    <EntryCard
                      entry={entry}
                      onPlayPress={
                        entry.isAudio
                          ? () => router.push("/record" as any)
                          : undefined
                      }
                    />
                  </View>
                ))}
              </View>
            ))}

            {/* ── Load more ── */}
            <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
              <Pressable
                style={({ pressed }) => ({
                  borderRadius: 26,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: RULE,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 13, fontWeight: "500", color: INK }}>
                  Load 2025 →
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>

        {/* ── FAB ── */}
        <Pressable
          onPress={() => router.push("/record" as any)}
          style={({ pressed }) => ({
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: AMBER,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            shadowColor: AMBER,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          })}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 28,
              fontWeight: "300",
              lineHeight: 32,
              marginTop: -2,
            }}
          >
            +
          </Text>
        </Pressable>

      </SafeAreaView>
    </View>
  );
}
