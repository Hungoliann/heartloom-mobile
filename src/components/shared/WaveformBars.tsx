import { useRef, useEffect } from "react";
import { View, Animated } from "react-native";

const BAR_COUNT = 24;
const MAX_HEIGHT = 56;
const MIN_ACTIVE_HEIGHT = 8;
const REST_HEIGHT = 4;
const AMBER = "#D27F14";

const BAR_SHAPE = Array.from({ length: BAR_COUNT }, (_, i) =>
  0.3 + Math.abs(Math.sin((i / BAR_COUNT) * Math.PI * 3)) * 0.7
);

interface WaveformBarsProps {
  active: boolean;
  meteringLevel: number;
}

export default function WaveformBars({ active, meteringLevel }: WaveformBarsProps) {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(REST_HEIGHT / MAX_HEIGHT))
  ).current;

  useEffect(() => {
    if (!active) {
      bars.forEach((bar) => {
        Animated.timing(bar, {
          toValue: REST_HEIGHT / MAX_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
      return;
    }

    bars.forEach((bar, i) => {
      const target = Math.max(MIN_ACTIVE_HEIGHT, meteringLevel * BAR_SHAPE[i] * MAX_HEIGHT);
      Animated.timing(bar, {
        toValue: target / MAX_HEIGHT,
        duration: 80,
        useNativeDriver: true,
      }).start();
    });
  }, [active, meteringLevel]);

  const barWidth = Math.floor(280 / BAR_COUNT) - 2;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        height: MAX_HEIGHT,
        gap: 2,
        justifyContent: "center",
        width: "100%",
      }}
    >
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{
            width: Math.max(3, barWidth),
            height: MAX_HEIGHT,
            backgroundColor: AMBER,
            borderRadius: 4,
            opacity: active ? 0.85 : 0.35,
            transform: [{ scaleY: bar }],
          }}
        />
      ))}
    </View>
  );
}
