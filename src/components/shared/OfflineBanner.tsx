import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";

/**
 * A thin banner that slides down from the top when the device loses network
 * connectivity and slides away when it returns. Mounted once at the root.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      // isInternetReachable can be null while resolving; treat null as online.
      const isOffline =
        state.isConnected === false || state.isInternetReachable === false;
      setOffline(isOffline);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: offline ? 0 : -60,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [offline, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingTop: insets.top + 8,
        paddingBottom: 10,
        backgroundColor: "#8B4226",
        alignItems: "center",
        zIndex: 9999,
        transform: [{ translateY }],
      }}
    >
      <Text style={{ color: "#FBF2DD", fontSize: 13, fontWeight: "600" }}>
        No connection — changes will sync when you're back online
      </Text>
    </Animated.View>
  );
}
