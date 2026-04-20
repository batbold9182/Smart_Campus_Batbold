import { StyleSheet } from "react-native";
import { palette, radius, space } from "../tokens";
import { ThemeMode } from "../theme";

export const getProfileCardStyles = (t: ThemeMode, _isDark: boolean) => {
  const styles = StyleSheet.create({
    card: {
      marginTop: space[5],
      borderRadius: radius.lg,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.cardBorder,
      padding: space[5],
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
      borderRadius: radius.full,
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
      paddingTop: space[2],
      borderTopWidth: 1,
      borderTopColor: t.cardBorder,
    },
    sectionTitle: {
      fontWeight: "700",
      marginBottom: space[1],
      color: t.text,
    },
    actionsBox: {
      marginTop: space[2],
    },
    button: {
      marginTop: space[2],
      backgroundColor: t.accentBar,
      borderRadius: radius.sm,
      alignItems: "center",
      paddingVertical: 10,
    },
    buttonText: {
      color: palette.white,
      fontWeight: "600",
    },
    secondaryButton: {
      marginTop: space[2],
      borderWidth: 1,
      borderColor: t.cardBorder,
      borderRadius: radius.sm,
      alignItems: "center",
      paddingVertical: 10,
      backgroundColor: t.bg,
    },
    secondaryButtonText: {
      color: t.text,
      fontWeight: "600",
    },
    message: {
      marginTop: space[2],
      color: t.muted,
      textAlign: "center",
    },
  });

  return styles;
};
