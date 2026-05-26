import { Platform } from "react-native";

export const SERIF = Platform.select({
  ios: "Georgia",
  android: "Lora_400Regular",
  default: "Georgia",
}) as string;

export const SERIF_ITALIC = Platform.select({
  ios: "Georgia",
  android: "Lora_400Regular_Italic",
  default: "Georgia",
}) as string;

export const SERIF_MEDIUM = Platform.select({
  ios: "Georgia",
  android: "Lora_500Medium",
  default: "Georgia",
}) as string;
