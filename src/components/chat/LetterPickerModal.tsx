import { View, Text, Modal, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Pressable } from "../ui/Pressable";
import { Colors } from "../../constants/colors";
import { SERIF, SERIF_ITALIC } from "../../constants/fonts";
import { useLetters } from "../../hooks/useLetters";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (letterId: string) => void;
};

function deliveryLabel(letter: {
  delivered_at: string | null;
  deliver_at: string | null;
}) {
  if (letter.delivered_at) return "Delivered";
  if (letter.deliver_at) {
    const d = new Date(letter.deliver_at);
    if (!Number.isNaN(d.getTime())) {
      return `Scheduled · ${d.toLocaleDateString()}`;
    }
  }
  return "Draft";
}

export function LetterPickerModal({ visible, onClose, onSelect }: Props) {
  const { data: letters = [], isLoading } = useLetters();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors.rule,
          }}
        >
          <Text
            style={{ fontFamily: SERIF, fontSize: 20, color: Colors.ink }}
          >
            Share a letter
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed
                ? "rgba(184,132,60,0.16)"
                : "transparent",
            })}
          >
            <Feather name="x" size={20} color={Colors.ink} />
          </Pressable>
        </View>

        {isLoading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator color={Colors.amberDeep} />
          </View>
        ) : letters.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
          >
            <Feather name="mail" size={28} color={Colors.amberDeep} />
            <Text
              style={{
                fontFamily: SERIF_ITALIC,
                fontStyle: "italic",
                fontSize: 14,
                color: Colors.inkMuted,
                textAlign: "center",
                marginTop: 12,
                lineHeight: 21,
              }}
            >
              You haven't written any letters yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={letters}
            keyExtractor={(l) => l.id}
            contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 12 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => {
              const snippet = (item.body ?? "").trim().slice(0, 80);
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  style={({ pressed }) => ({
                    backgroundColor: Colors.parchment,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(184,132,60,0.22)",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontFamily: SERIF,
                      fontSize: 15,
                      color: Colors.ink,
                    }}
                    numberOfLines={1}
                  >
                    To {item.recipient_name ?? item.title ?? "—"}
                  </Text>
                  {snippet ? (
                    <Text
                      style={{
                        fontFamily: SERIF_ITALIC,
                        fontStyle: "italic",
                        fontSize: 12.5,
                        color: Colors.inkSoft,
                        marginTop: 4,
                        lineHeight: 17,
                      }}
                      numberOfLines={2}
                    >
                      {snippet}
                      {(item.body?.length ?? 0) > 80 ? "…" : ""}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      fontSize: 10.5,
                      color: Colors.amberDeep,
                      marginTop: 6,
                      letterSpacing: 0.3,
                      textTransform: "uppercase",
                      fontWeight: "700",
                    }}
                  >
                    {deliveryLabel(item)}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
