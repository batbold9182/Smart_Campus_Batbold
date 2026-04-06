import { StyleSheet } from "react-native";
import { ThemeMode } from "./theme";

export const getDashboardStyles = (t: ThemeMode, width: number, isDark: boolean) => {
  const quickActionCardWidth = Math.max((width - 52) / 2, 140);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    scrollContent: { paddingBottom: 24 },
    headerGradient: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerLogoWrap: { alignItems: "center", justifyContent: "center" },
    headerLogo: { width: 360, height: 80 },
    contentPadding: { paddingHorizontal: 20 },

    // Profile row
    profileRow: {
      marginTop: 20,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    profileRowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    profileAvatarBtn: { marginRight: 12 },
    profileAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: "#22c55e",
      overflow: "hidden",
      backgroundColor: t.avatarBg,
    },
    profileAvatarImage: { width: 44, height: 44, borderRadius: 22 },
    profileAvatarFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
    onlineDot: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#22c55e",
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
      borderRadius: 18,
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
      backgroundColor: "#ef4444",
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

    // Stats row
    statsRow: { marginBottom: 16, flexDirection: "row", gap: 8 },
    statsCard: {
      flex: 1,
      backgroundColor: t.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.cardBorder,
      paddingVertical: 10,
      alignItems: "center",
    },
    statsCardGreen: {
      flex: 1,
      backgroundColor: t.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#22c55e",
      paddingVertical: 10,
      alignItems: "center",
    },
    statsValue: { fontSize: 16, fontWeight: "bold", color: t.text },
    statsLabel: { color: t.muted, fontSize: 10, marginTop: 1 },

    // Schedule section
    scheduleCard: {
      backgroundColor: t.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.cardBorder,
      padding: 16,
      marginBottom: 24,
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
      marginRight: 8,
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: t.text },
    viewAllLink: { color: t.scheduleLink, fontSize: 13 },

    // Empty schedule
    emptyScheduleWrap: { alignItems: "center", paddingVertical: 16 },
    emptyScheduleEmoji: { fontSize: 40, marginBottom: 8 },
    emptyScheduleTitle: { fontSize: 15, fontWeight: "600", color: t.text },
    emptyScheduleSubtitle: { color: t.muted, fontSize: 13, marginTop: 2 },

    // Schedule item
    scheduleItemContent: { flex: 1 },
    scheduleTime: { marginRight: 12, width: 90, fontWeight: "bold", color: t.text },
    scheduleCourseName: { fontWeight: "600", color: t.text },
    scheduleProf: { color: t.prof, fontSize: 12, marginTop: 2 },
    scheduleRoom: { color: t.muted, fontSize: 12 },
    scheduleBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },

    // Quick actions
    quickActionsSection: { marginBottom: 16 },
    quickActionsSectionHeader: {
      marginBottom: 16,
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
      paddingVertical: 20,
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    quickActionIconWrap: {
      width: 50,
      height: 50,
      borderRadius: 14,
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
      marginTop: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(168,85,247,0.15)"
        : "rgba(124,58,237,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },

    // Logout
    logoutGradient: { borderRadius: 12, marginBottom: 16 },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    logoutText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  });

  // Dynamic styles that depend on runtime values
  const statsIconWrap = (bgColor: string) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: bgColor,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 4,
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
      status === "Now" ? "#22c55e" : status === "Done" ? "#6b7280" : "#3b82f6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  });

  const quickActionPressable = (
    pressed: boolean,
    gradientColor: string
  ) => ({
    width: "100%" as const,
    backgroundColor: t.surface,
    borderRadius: 20,
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
