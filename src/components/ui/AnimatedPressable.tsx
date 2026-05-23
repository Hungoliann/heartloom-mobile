import { useRef } from "react";
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function AnimatedPressable({
  children,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn(e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) {
    Animated.spring(scale, {
      toValue: 0.95,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
    onPressIn?.(e);
  }

  function handlePressOut(e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) {
    Animated.spring(scale, {
      toValue: 1,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  }

  return (
    <AnimatedPressableBase
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
