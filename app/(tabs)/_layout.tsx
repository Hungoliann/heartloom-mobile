import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#B06600",
        tabBarInactiveTintColor: "#8A7A66",
        tabBarStyle: {
          backgroundColor: "#FAF3E2",
          borderTopColor: "rgba(45,36,26,0.08)",
          borderTopWidth: 1,
          height: 76,
          paddingBottom: 16,
          paddingTop: 9,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "600",
          letterSpacing: 0.3,
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: "Timeline",
          tabBarIcon: ({ color }) => <Feather name="book-open" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="concierge"
        options={{
          title: "Concierge",
          tabBarIcon: ({ color }) => <Feather name="compass" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Feather name="message-circle" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "You",
          tabBarIcon: ({ color }) => <Feather name="user" size={20} color={color} />,
        }}
      />
      <Tabs.Screen name="vault" options={{ href: null }} />
      <Tabs.Screen name="family" options={{ href: null }} />
      <Tabs.Screen name="legacy" options={{ href: null }} />
    </Tabs>
  );
}
