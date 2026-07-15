import { Alert, Platform } from "react-native";

/**
 * Cross-platform confirmation dialog.
 *
 * `Alert.alert` is a no-op on react-native-web, so on web we fall back to the
 * native `window.confirm`. Resolves `true` when the user confirms, `false`
 * otherwise (including when the dialog is dismissed).
 */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = "Confirm",
  destructive = false
): Promise<boolean> {
  if (Platform.OS === "web") {
    const ok =
      typeof window !== "undefined" && typeof window.confirm === "function"
        ? window.confirm(`${title}\n\n${message}`)
        : true;
    return Promise.resolve(ok);
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: destructive ? "destructive" : "default",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
