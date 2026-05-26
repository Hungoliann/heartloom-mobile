import { Pressable } from "../src/components/ui/Pressable";
import { SERIF } from "../src/constants/fonts";
import {
  View,
  Text,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../src/constants/colors";

const EFFECTIVE_DATE = "May 25, 2026";
const CONTACT_EMAIL = "privacy@heartloom.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.ink, marginBottom: 8, fontFamily: SERIF }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 13.5, color: Colors.inkSoft, lineHeight: 21, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 5 }}>
      <Text style={{ fontSize: 13.5, color: Colors.amberDeep, lineHeight: 21 }}>•</Text>
      <Text style={{ flex: 1, fontSize: 13.5, color: Colors.inkSoft, lineHeight: 21 }}>{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
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
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color={Colors.inkSoft} />
          </Pressable>
          <Text style={{ fontSize: 17, fontFamily: SERIF, fontWeight: "600", color: Colors.ink }}>
            Privacy Policy
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        >
          <Text style={{ fontSize: 12, color: Colors.inkMuted, marginBottom: 20 }}>
            Effective date: {EFFECTIVE_DATE}
          </Text>

          <P>
            Heartloom ("we", "us", or "our") operates the Heartloom mobile application. This policy explains what
            personal information we collect, why we collect it, and how we handle it. We built Heartloom to
            preserve your family's most important words — protecting that trust is non-negotiable.
          </P>

          <Section title="1. Information We Collect">
            <P>We collect only what is necessary to provide the service:</P>
            <Bullet>Email address and password (via Supabase Auth) to create and secure your account.</Bullet>
            <Bullet>Full name, optionally provided during onboarding, to personalise your experience.</Bullet>
            <Bullet>Voice recordings, photos, and written letters you create — stored encrypted in Supabase Storage.</Bullet>
            <Bullet>Legal documents (wills, advance directives) you voluntarily upload to your Vault.</Bullet>
            <Bullet>Expo push notification token, to deliver letter-arrival alerts to your device.</Bullet>
            <Bullet>Family membership data — which profiles belong to the same family group.</Bullet>
            <Bullet>Usage timestamps (when letters are created, sealed, and delivered).</Bullet>
          </Section>

          <Section title="2. How We Use Your Information">
            <Bullet>To authenticate you and keep your account secure.</Bullet>
            <Bullet>To store and deliver your future letters at the date you choose.</Bullet>
            <Bullet>To send push notifications when a letter is delivered or a family member joins.</Bullet>
            <Bullet>To display your memories, documents, and family circle within the app.</Bullet>
            <Bullet>To provide concierge services if you subscribe to the Family Concierge plan.</Bullet>
            <P>We do not use your content to train AI models. We do not sell your data. We do not serve advertisements.</P>
          </Section>

          <Section title="3. Data Storage and Security">
            <P>
              All data is stored on Supabase infrastructure hosted in the United States (West US — Oregon region).
              Your auth tokens are stored on-device using iOS Keychain / Android Keystore via expo-secure-store — never
              in plain text. Voice recordings and documents are stored in private Supabase Storage buckets;
              access requires a short-lived signed URL generated at the moment you open the file.
            </P>
            <P>
              Row Level Security (RLS) is enforced at the database level: your data is only readable
              by authenticated members of your family group and by our service backend.
            </P>
          </Section>

          <Section title="4. Data Sharing">
            <P>We share data only in these limited circumstances:</P>
            <Bullet>With Supabase (database, storage, authentication infrastructure).</Bullet>
            <Bullet>With Inngest (scheduled job execution for letter delivery — no letter content is shared, only metadata).</Bullet>
            <Bullet>With Expo (push notification delivery — only your push token and notification payload).</Bullet>
            <Bullet>With family members you explicitly invite and who accept using a valid invite code.</Bullet>
            <Bullet>With law enforcement if required by a valid legal process.</Bullet>
            <P>No other third parties receive your personal information.</P>
          </Section>

          <Section title="5. Your Rights">
            <P>You have the right to:</P>
            <Bullet>Access all personal information we hold about you.</Bullet>
            <Bullet>Correct inaccurate data through the app's profile settings.</Bullet>
            <Bullet>Delete your account and all associated data — email us and we will complete deletion within 30 days.</Bullet>
            <Bullet>Export your letters and recordings — contact us and we will provide a data export.</Bullet>
            <Bullet>Withdraw consent for push notifications at any time via your device settings.</Bullet>
          </Section>

          <Section title="6. Children's Privacy">
            <P>
              Heartloom is not directed at children under 13. We do not knowingly collect personal information
              from children under 13. If you believe a child has provided us with personal information, please
              contact us and we will delete it promptly.
            </P>
          </Section>

          <Section title="7. Data Retention">
            <P>
              We retain your data for as long as your account is active. Letters marked for future delivery are
              retained until delivered. After account deletion we purge all personal data within 30 days, except
              where retention is required by law.
            </P>
          </Section>

          <Section title="8. Changes to This Policy">
            <P>
              We may update this policy as the app evolves. We will notify you of material changes via
              in-app notification or email at least 14 days before the change takes effect. Continued use
              after that date constitutes acceptance.
            </P>
          </Section>

          <Section title="9. Contact Us">
            <P>
              Questions, requests, or concerns? We're a small team and we respond personally.
            </P>
            <P>Email: {CONTACT_EMAIL}</P>
            <P>Heartloom, Inc. · Portland, Oregon, United States</P>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
