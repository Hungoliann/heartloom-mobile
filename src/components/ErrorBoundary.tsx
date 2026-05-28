import { SERIF } from "../constants/fonts";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Colors } from "../constants/colors";

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] caught error:", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: Colors.cream, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Text style={{ fontFamily: SERIF, fontSize: 22, fontWeight: "600", color: Colors.ink, textAlign: "center", marginBottom: 12 }}>
          Something went wrong.
        </Text>
        <Text style={{ fontSize: 13, color: Colors.inkMuted, textAlign: "center", lineHeight: 20, marginBottom: 28 }}>
          We&apos;ve hit an unexpected snag. Your letters and memories are safe. Try again, and if it keeps happening, please restart the app.
        </Text>
        <Pressable
          onPress={this.reset}
          style={({ pressed }) => ({
            backgroundColor: Colors.ink,
            borderRadius: 999,
            paddingVertical: 12,
            paddingHorizontal: 28,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.cream }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
