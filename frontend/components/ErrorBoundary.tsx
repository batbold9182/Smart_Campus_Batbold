import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    if (__DEV__) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-app-bg px-8">
          <Text className="mb-2 text-[22px] font-bold text-app-text">Something went wrong</Text>
          <Text className="mb-6 text-center text-app-muted">
            An unexpected error occurred. Please reload the app.
          </Text>
          <TouchableOpacity
            className="rounded-xl bg-blue-600 px-6 py-3"
            onPress={this.handleReload}
          >
            <Text className="font-semibold text-white">Reload</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
