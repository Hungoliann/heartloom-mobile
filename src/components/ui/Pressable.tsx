import { useState } from "react";
import {
  Pressable as RNPressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from "react-native";

type StyleFn = (state: PressableStateCallbackType) => StyleProp<ViewStyle>;
type Props = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle> | StyleFn;
};

export function Pressable({ style, onPressIn, onPressOut, ...rest }: Props) {
  const [pressed, setPressed] = useState(false);
  const resolved =
    typeof style === "function"
      ? style({ pressed })
      : style;
  return (
    <RNPressable
      {...rest}
      style={resolved}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
    />
  );
}
