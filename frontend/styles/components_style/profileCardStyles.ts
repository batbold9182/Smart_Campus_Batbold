import { StyleSheet } from "react-native";
import { ThemeMode } from "../theme";

export const getProfileCardStyles = (t: ThemeMode, isDark: boolean) => {
  const styles = StyleSheet.create({
    card: {
      marginTop: 20,
      borderRadius: 16,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.cardBorder,
      padding: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: t.text,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      marginBottom: 10,
      alignSelf: "center",
      borderWidth: 2,
      borderColor: t.accentBar,
    },
    helperText: {
      marginBottom: 10,
      textAlign: "center",
      color: t.muted,
      fontSize: 12,
    },
    fieldText: {
      color: t.text,
      marginBottom: 2,
      fontSize: 14,
    },
    sectionWrap: {
      marginTop: 10,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: t.cardBorder,
    },
    sectionTitle: {
      fontWeight: "700",
      marginBottom: 4,
      color: t.text,
    },
    actionsBox: {
      marginTop: 8,
    },
    button: {
      marginTop: 8,
      backgroundColor: t.accentBar,
      borderRadius: 8,
      alignItems: "center",
      paddingVertical: 10,
    },
    buttonText: {
      color: "#ffffff",
      fontWeight: "600",
    },
    secondaryButton: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: t.cardBorder,
      borderRadius: 8,
      alignItems: "center",
      paddingVertical: 10,
      backgroundColor: t.bg,
    },
    secondaryButtonText: {
      color: t.text,
      fontWeight: "600",
    },
    message: {
      marginTop: 8,
      color: t.muted,
      textAlign: "center",
    },
  });

  return styles;
};
