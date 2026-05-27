import { View, Text } from "react-native";

import { Colors } from "../../constants/colors";

function initialOf(name: string | null | undefined) {
  if (!name) return "?";
  const c = name.trim()[0];
  return c ? c.toUpperCase() : "?";
}

/**
 * A row of up to 3 tiny initial-avatars representing family members whose
 * `last_read_at` reaches this message. Rendered right beneath a sent message.
 */
export function ReadReceiptAvatars({
  readers,
}: {
  readers: { full_name: string | null }[];
}) {
  if (!readers || readers.length === 0) return null;
  const shown = readers.slice(0, 3);
  const extra = readers.length - shown.length;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
        marginRight: 4,
        gap: 2,
      }}
    >
      {shown.map((r, idx) => (
        <View
          key={idx}
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: Colors.amberDeep,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: idx === 0 ? 0 : -4,
            borderWidth: 1,
            borderColor: Colors.bg,
          }}
        >
          <Text
            style={{
              fontSize: 8,
              fontWeight: "700",
              color: Colors.white,
            }}
          >
            {initialOf(r.full_name)}
          </Text>
        </View>
      ))}
      {extra > 0 ? (
        <Text
          style={{
            fontSize: 9,
            color: Colors.inkMuted,
            marginLeft: 4,
          }}
        >
          +{extra}
        </Text>
      ) : null}
    </View>
  );
}
