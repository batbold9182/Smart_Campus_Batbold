import { StyleSheet } from "react-native";
import { palette, radius, space } from "../tokens";
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
          paddingHorizontal: space[3],
          paddingVertical: space[4],
        }
      : {
          paddingHorizontal: space[4],
          paddingBottom: space[2],
          paddingTop: space[3],
          backgroundColor: t.bg,
        },
    sidebarTitle: { fontSize: 18, fontWeight: "bold", color: t.text },
    sidebarSubtitle: { marginTop: space[1], fontSize: 12, color: t.muted },
    scroll: { marginTop: isWide ? space[4] : space[3] },
    scrollContent: isWide
      ? { gap: space[2], paddingBottom: space[6] }
      : { gap: space[2], paddingRight: space[2] },
    floorBtn: {
      minWidth: isWide ? undefined : 90,
      width: isWide ? "100%" : undefined,
      borderRadius: radius.md,
      borderWidth: 1,
      paddingHorizontal: space[3],
      paddingVertical: space[2],
    },
    contentArea: { flex: 1, backgroundColor: t.bg, padding: space[3] },
    topBar: {
      marginBottom: space[2],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: space[2],
      borderRadius: radius.md,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.cardBorder,
      paddingHorizontal: space[3],
      paddingVertical: space[2],
    },
    topBarTitle: { fontSize: 16, fontWeight: "bold", color: t.text },
    themeToggle: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: t.avatarBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
    backButton: {
      borderRadius: radius.sm,
      paddingHorizontal: space[3],
      paddingVertical: space[1] + 2,
      backgroundColor: isDark ? t.accentBar : palette.gray900,
    },
    backButtonText: { fontSize: 12, fontWeight: "600", color: palette.white },
    imageWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.md,
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
    color: active ? palette.white : t.text,
  });

  const floorBtnSub = (active: boolean) => ({
    textAlign: "center" as const,
    fontSize: 11,
    color: active ? t.overlayLight : t.muted,
  });

  return { ...styles, floorBtnDynamic, floorBtnTitle, floorBtnSub };
};
