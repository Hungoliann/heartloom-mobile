import { Pressable } from "../src/components/ui/Pressable";
import { SERIF } from "../src/constants/fonts";
import {
  Linking,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../src/constants/colors";

const TERMS_URL = "https://heartloom.com/terms";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(45,36,26,0.07)",
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginRight: 12, padding: 4 })}
          >
            <Feather name="chevron-left" size={22} color={Colors.inkSoft} />
          </Pressable>
          <Text style={{ fontSize: 17, fontFamily: SERIF, fontWeight: "600", color: Colors.ink }}>
            Terms of Service
          </Text>
        </View>

        {/* Body */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Feather name="file-text" size={40} color={Colors.amber} style={{ marginBottom: 20 }} />
          <Text
            style={{
              fontSize: 20,
              fontFamily: SERIF,
              fontWeight: "600",
              color: Colors.ink,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Terms of Service
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.inkMuted,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 32,
            }}
          >
            By using Heartloom, you agree to our terms of service. Read the full terms to understand your rights and responsibilities.
          </Text>
          <Pressable
            onPress={() => Linking.openURL(TERMS_URL)}
            style={({ pressed }) => ({
              backgroundColor: Colors.amber,
              paddingVertical: 13,
              paddingHorizontal: 28,
              borderRadius: 12,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.white, fontFamily: SERIF }}>
              View full terms
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
