import { StyleSheet } from "react-native";
import { palette, radius, space } from "./tokens";
import { ThemeMode } from "./theme";

export const getDashboardStyles = (t: ThemeMode, width: number, isDark: boolean) => {
  const quickActionCardWidth = Math.max((width - space[4] * 3) / 2, 140);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    scrollContent: { paddingBottom: space[6] },
    headerGradient: {
      paddingHorizontal: space[5],
      paddingBottom: space[2],
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
    },
    headerLogoWrap: { alignItems: "center", justifyContent: "center" },
    headerLogo: { width: Math.round(width * 0.9), height: Math.round(width * 0.9 * (80 / 360)) },
    contentPadding: { paddingHorizontal: space[5] },

    // Profile row
    profileRow: {
      marginTop: space[5],
      marginBottom: space[4],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    profileRowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    profileAvatarBtn: { marginRight: 12 },
    profileAvatar: {
      width: 48,
      height: 48,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: t.online,
      overflow: "hidden",
      backgroundColor: t.avatarBg,
    },
    profileAvatarImage: { width: 44, height: 44, borderRadius: radius.full },
    profileAvatarFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
    onlineDot: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 12,
      height: 12,
      borderRadius: radius.full,
      backgroundColor: t.online,
      borderWidth: 2,
      borderColor: t.greenBorderBg,
    },
    profileTextWrap: { flex: 1 },
    profileTitle: { fontSize: 22, fontWeight: "bold", color: t.text },
    profileSubtitle: { color: t.muted, fontSize: 13 },

    // Header actions (theme toggle + bell)
    headerActions: { flexDirection: "row", alignItems: "center" },
    themeToggle: {
      marginRight: 12,
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: t.avatarBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
    badge: {
      position: "absolute",
      top: -4,
      right: -6,
      backgroundColor: t.error,
      borderRadius: radius.full,
      minWidth: 18,
      height: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: space[1],
    },
    badgeText: { color: palette.white, fontSize: 10, fontWeight: "bold" },

    // Stats row
    statsRow: { marginBottom: space[4], flexDirection: "row", gap: space[2] },
    statsCard: {
      flex: 1,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.cardBorder,
      paddingVertical: 10,
      alignItems: "center",
    },
    statsCardGreen: {
      flex: 1,
      backgroundColor: t.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.online,
      paddingVertical: 10,
      alignItems: "center",
    },
    statsValue: { fontSize: 16, fontWeight: "bold", color: t.text },
    statsLabel: { color: t.muted, fontSize: 10, marginTop: 1 },

    // Schedule section
    scheduleCard: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.cardBorder,
      padding: space[4],
      marginBottom: space[6],
    },
    scheduleHeader: {
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitleRow: { flexDirection: "row", alignItems: "center" },
    accentBar: {
      width: 4,
      height: 20,
      backgroundColor: t.accentBar,
      borderRadius: 2,
      marginRight: space[2],
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: t.text },
    viewAllLink: { color: t.scheduleLink, fontSize: 13 },

    // Empty schedule
    emptyScheduleWrap: { alignItems: "center", paddingVertical: space[4] },
    emptyScheduleEmoji: { fontSize: 40, marginBottom: space[2] },
    emptyScheduleTitle: { fontSize: 15, fontWeight: "600", color: t.text },
    emptyScheduleSubtitle: { color: t.muted, fontSize: 13, marginTop: 2 },

    // Schedule item
    scheduleItemContent: { flex: 1 },
    scheduleTime: { marginRight: 12, width: 90, fontWeight: "bold", color: t.text },
    scheduleCourseName: { fontWeight: "600", color: t.text },
    scheduleProf: { color: t.prof, fontSize: 12, marginTop: 2 },
    scheduleRoom: { color: t.muted, fontSize: 12 },
    scheduleBadgeText: { color: palette.white, fontSize: 11, fontWeight: "bold" },

    // Quick actions
    quickActionsSection: { marginBottom: space[4] },
    quickActionsSectionHeader: {
      marginBottom: space[4],
      flexDirection: "row",
      alignItems: "center",
    },
    quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    quickActionCardWrap: { width: quickActionCardWidth, marginBottom: 14 },
    quickActionGradientBar: { height: 4, width: "100%" },
    quickActionContent: {
      paddingVertical: space[5],
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    quickActionIconWrap: {
      width: 50,
      height: 50,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    quickActionLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: t.text,
      textAlign: "center",
      marginBottom: 2,
    },
    quickActionSubtitle: { fontSize: 11, color: t.muted, textAlign: "center" },
    quickActionArrowWrap: {
      marginTop: space[2],
      width: 24,
      height: 24,
      borderRadius: radius.full,
      backgroundColor: t.avatarBg,
      alignItems: "center",
      justifyContent: "center",
    },

    // Logout
    logoutGradient: { borderRadius: radius.md, marginBottom: space[4] },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: space[4],
    },
    logoutText: { fontSize: 16, fontWeight: "600", color: palette.white },
  });

  // Dynamic styles that depend on runtime values
  const statsIconWrap = (bgColor: string) => ({
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: bgColor,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: space[1],
  });

  const scheduleItemRow = (isLast: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: t.schedDivider,
    paddingBottom: 10,
    marginBottom: 10,
  });

  const scheduleBadge = (status: string) => ({
    backgroundColor:
      status === "Now"  ? t.online :
      status === "Done" ? palette.grayNeutral :
                          t.scheduleLink,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: space[1],
  });

  const quickActionPressable = (
    pressed: boolean,
    gradientColor: string
  ) => ({
    width: "100%" as const,
    backgroundColor: t.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: pressed ? gradientColor : t.cardBorder,
    overflow: "hidden" as const,
    transform: [{ scale: pressed ? 0.96 : 1 }],
    shadowColor: gradientColor,
    shadowOffset: { width: 0, height: pressed ? 2 : 6 },
    shadowOpacity: isDark ? 0.35 : 0.12,
    shadowRadius: pressed ? 4 : 14,
    elevation: pressed ? 2 : 6,
  });

  return { ...styles, statsIconWrap, scheduleItemRow, scheduleBadge, quickActionPressable };
};
