import { useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "../../src/constants/colors";
import { useConciergeTasks } from "../../src/hooks/useConciergeTasks";

// ─── Data ─────────────────────────────────────────────────────────────────────
type TaskStatus = "done" | "prog" | "pending";

interface Task {
  id: string;
  status: TaskStatus;
  title: string;
  sub: string | null;
  progress?: number | null; // 0–1, only for "prog"
}

const CHIPS = ["Medicare", "Hospice", "Estate logistics"];

// ─── Task icon ─────────────────────────────────────────────────────────────────
function TaskIco({ status }: { status: TaskStatus }) {
  if (status === "done") {
    // filled sage circle with a checkmark character
    return (
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: Colors.sageDeep,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
          flexShrink: 0,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700", lineHeight: 14 }}>
          ✓
        </Text>
      </View>
    );
  }
  if (status === "prog") {
    // filled amber circle with a bullet
    return (
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: Colors.amber,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
          flexShrink: 0,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#FFFFFF",
          }}
        />
      </View>
    );
  }
  // pending — hollow ring
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "rgba(110,80,40,0.4)",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
        flexShrink: 0,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: Colors.inkMuted,
          opacity: 0.35,
        }}
      />
    </View>
  );
}

// ─── Task row ──────────────────────────────────────────────────────────────────
function TaskRow({ task }: { task: Task }) {
  const isDone = task.status === "done";
  const isProg = task.status === "prog";

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        backgroundColor: isDone
          ? "rgba(156,175,136,0.07)"
          : "rgba(255,250,232,0.7)",
        borderWidth: 1,
        borderColor: isDone
          ? "rgba(110,139,94,0.4)"
          : "rgba(184,132,60,0.22)",
        borderRadius: 12,
        paddingHorizontal: 13,
        paddingVertical: 14,
        alignItems: "flex-start",
      }}
    >
      <TaskIco status={task.status} />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Georgia",
            fontSize: 14.5,
            color: Colors.ink,
            lineHeight: 20,
          }}
        >
          {task.title}
        </Text>
        <Text
          style={{
            fontFamily: "Georgia",
            fontStyle: "italic",
            fontSize: 12,
            color: Colors.inkSoft,
            lineHeight: 17,
            marginTop: 3,
          }}
        >
          {task.sub}
        </Text>

        {/* Progress bar — only for in-progress tasks */}
        {isProg && task.progress !== undefined && (
          <View
            style={{
              marginTop: 8,
              height: 3,
              backgroundColor: "rgba(74,47,24,0.10)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 3,
                width: `${(task.progress ?? 0) * 100}%`,
                backgroundColor: Colors.amber,
                borderRadius: 999,
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ConciergeScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;
  const { data: tasks, isLoading } = useConciergeTasks();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: Colors.bg,
            borderBottomWidth: 1,
            borderBottomColor: Colors.rule,
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
              borderColor: Colors.rule,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 22, color: Colors.inkSoft, lineHeight: 26 }}>
              ‹
            </Text>
          </Pressable>

          {/* Title */}
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: 14,
              color: Colors.inkSoft,
            }}
          >
            Concierge
          </Text>

          {/* "Available" badge */}
          <View style={{ width: 48, alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 0.16 * 11,
                color: Colors.inkMuted,
              }}
            >
              Available
            </Text>
          </View>
        </View>

        {/* ── Scrollable content ────────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Animated.View
            style={{ opacity, transform: [{ translateY: slideY }] }}
          >
            {/* ── Naomi card ──────────────────────────────────────────── */}
            <View
              style={{
                marginHorizontal: 22,
                marginTop: 20,
                backgroundColor: "rgba(255,250,232,0.7)",
                borderWidth: 1,
                borderColor: "rgba(184,132,60,0.22)",
                borderRadius: 16,
                padding: 14,
                // matching pt-naomi: background with radial gradient feel
              }}
            >
              {/* Top row: avatar + text */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                {/* Avatar with online dot */}
                <View style={{ position: "relative", flexShrink: 0 }}>
                  {/* Gradient avatar: linear-gradient(135deg, sage, #4f6940) */}
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: Colors.sageDeep,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Georgia",
                        fontSize: 22,
                        color: "#FFFFFF",
                        fontWeight: "600",
                        letterSpacing: 0.04 * 22,
                      }}
                    >
                      N
                    </Text>
                  </View>
                  {/* Online dot */}
                  <View
                    style={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: Colors.sageDeep,
                      borderWidth: 2,
                      borderColor: Colors.bg,
                    }}
                  />
                </View>

                {/* Name + subtitle + chips */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Georgia",
                      fontSize: 16,
                      color: Colors.ink,
                      lineHeight: 21,
                    }}
                  >
                    Naomi Park, RN, MSW
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Georgia",
                      fontStyle: "italic",
                      fontSize: 12,
                      color: Colors.inkMuted,
                      marginTop: 2,
                      marginBottom: 6,
                      lineHeight: 17,
                    }}
                  >
                    Your Concierge · 11 years in geriatric care · Bay Area
                  </Text>

                  {/* Specialty chips */}
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 4,
                    }}
                  >
                    {CHIPS.map((chip) => (
                      <View
                        key={chip}
                        style={{
                          borderWidth: 1,
                          borderColor: Colors.rule,
                          backgroundColor: Colors.cream,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 24,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            letterSpacing: 0.12 * 10,
                            color: Colors.ink,
                            fontWeight: "600",
                            textTransform: "uppercase",
                          }}
                        >
                          {chip}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Action buttons row */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* Primary: Message Naomi */}
                <Pressable
                  onPress={() => router.push("/(tabs)/chat")}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 44,
                    backgroundColor: Colors.ink,
                    borderRadius: 26,
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: "500",
                      color: Colors.bg,
                    }}
                  >
                    Message Naomi
                  </Text>
                </Pressable>

                {/* Ghost: Schedule a call */}
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Schedule a call",
                      "Call scheduling coming soon."
                    )
                  }
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 44,
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: Colors.rule,
                    borderRadius: 26,
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: "500",
                      color: Colors.ink,
                    }}
                  >
                    Schedule a call
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* ── Section title: "In motion for you" ──────────────────── */}
            <Text
              style={{
                marginTop: 22,
                marginBottom: 8,
                marginHorizontal: 22,
                fontFamily: "System",
                fontSize: 10,
                letterSpacing: 0.32 * 10,
                textTransform: "uppercase",
                color: Colors.inkMuted,
              }}
            >
              In motion for you
            </Text>

            {/* ── Task list ───────────────────────────────────────────── */}
            {isLoading ? (
              <View style={{ paddingHorizontal: 22, gap: 8 }}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={{
                      height: 72,
                      borderRadius: 12,
                      backgroundColor: "rgba(45,36,26,0.06)",
                    }}
                  />
                ))}
              </View>
            ) : tasks && tasks.length > 0 ? (
              <View style={{ marginHorizontal: 22, gap: 8 }}>
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task as Task} />
                ))}
              </View>
            ) : (
              <Text
                style={{
                  marginHorizontal: 22,
                  fontSize: 13,
                  color: Colors.inkMuted,
                  fontStyle: "italic",
                }}
              >
                No active tasks right now.
              </Text>
            )}

            {/* ── Promise card ────────────────────────────────────────── */}
            <View
              style={{
                marginHorizontal: 22,
                marginTop: 20,
                backgroundColor: "#2C1D10",
                borderWidth: 1,
                borderColor: "rgba(210,127,20,0.20)",
                borderRadius: 16,
                padding: 18,
                paddingBottom: 16,
                overflow: "hidden",
              }}
            >
              {/* Ambient amber glow — simulated with a View overlay */}
              <View
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: "rgba(210,127,20,0.22)",
                  pointerEvents: "none",
                }}
              />

              <Text
                style={{
                  fontFamily: "System",
                  fontSize: 10.5,
                  letterSpacing: 0.28 * 10.5,
                  color: "rgba(245,224,165,0.7)",
                  textTransform: "uppercase",
                  marginBottom: 0,
                }}
              >
                THE LAND OF PROMISE
              </Text>

              <Text
                style={{
                  fontFamily: "Georgia",
                  fontStyle: "italic",
                  fontSize: 18,
                  lineHeight: 24,
                  color: Colors.bg,
                  marginTop: 10,
                  marginBottom: 8,
                }}
              >
                "You will never sit on hold for your family again."
              </Text>

              <Text
                style={{
                  fontFamily: "Georgia",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "rgba(245,224,165,0.78)",
                  lineHeight: 19,
                }}
              >
                A real human, in your timezone, who knows your family's story before they pick up.
              </Text>
            </View>

          </Animated.View>
        </ScrollView>

        <SafeAreaView edges={["bottom"]} />
      </SafeAreaView>
    </View>
  );
}
