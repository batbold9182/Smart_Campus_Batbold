import { StyleSheet } from "react-native";
import { ThemeMode } from "../theme";

export const getBuildingMapStyles = (t: ThemeMode, isWide: boolean, isDark: boolean) => {
  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.bg },
    rootRow: { flex: 1, flexDirection: isWide ? "row" : "column" },
    sidebar: isWide
      ? {
          width: 160,
          borderRightWidth: 1,
          borderRightColor: t.cardBorder,
          backgroundColor: t.surface,
          paddingHorizontal: 12,
          paddingVertical: 16,
        }
      : {
          paddingHorizontal: 16,
          paddingBottom: 8,
          paddingTop: 12,
          backgroundColor: t.bg,
        },
    sidebarTitle: { fontSize: 18, fontWeight: "bold", color: t.text },
    sidebarSubtitle: { marginTop: 4, fontSize: 12, color: t.muted },
    scroll: { marginTop: isWide ? 16 : 12 },
    scrollContent: isWide
      ? { gap: 8, paddingBottom: 24 }
      : { gap: 8, paddingRight: 8 },
    floorBtn: {
      minWidth: isWide ? undefined : 90,
      width: isWide ? "100%" : undefined,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    contentArea: { flex: 1, backgroundColor: t.bg, padding: 12 },
    topBar: {
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      borderRadius: 12,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.cardBorder,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    topBarTitle: { fontSize: 16, fontWeight: "bold", color: t.text },
    themeToggle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.avatarBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
    backButton: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: isDark ? t.accentBar : "#111827",
    },
    backButtonText: { fontSize: 12, fontWeight: "600", color: "#ffffff" },
    imageWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
  });

  const floorBtnDynamic = (active: boolean) => ({
    borderColor: active ? t.accentBar : t.cardBorder,
    backgroundColor: active ? t.accentBar : t.surface,
  });

  const floorBtnTitle = (active: boolean) => ({
    textAlign: "center" as const,
    fontSize: 20,
    fontWeight: "bold" as const,
    color: active ? "#ffffff" : t.text,
  });

  const floorBtnSub = (active: boolean) => ({
    textAlign: "center" as const,
    fontSize: 11,
    color: active ? "rgba(255,255,255,0.7)" : t.muted,
  });

  return { ...styles, floorBtnDynamic, floorBtnTitle, floorBtnSub };
};
