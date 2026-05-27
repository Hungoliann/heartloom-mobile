import { View, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
};

export function ChatSearchBar({ value, onChange, onClose }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(255,250,232,0.92)",
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "rgba(184,132,60,0.30)",
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}
      >
        <Feather name="search" size={14} color={Colors.inkMuted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search messages…"
          placeholderTextColor={Colors.inkMuted}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          style={{
            flex: 1,
            fontSize: 14,
            color: Colors.ink,
            paddingVertical: 4,
          }}
        />
      </View>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Feather name="x" size={18} color={Colors.amberDeep} />
      </Pressable>
    </View>
  );
}
