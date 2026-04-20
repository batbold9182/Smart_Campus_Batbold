import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getDashboardStyles } from "../styles/dashboardStyles";
import { useTheme } from "../contexts/ThemeContext";
import { haptic } from "../utils/haptics";
import { gradients, palette } from "../styles/tokens";
import type { AppUserProfile } from "../services/userService";

export type QuickAction = {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: readonly [string, string];
  route: string;
};

type Props = {
  user: AppUserProfile;
  unreadCount: number;
  todaySchedule: any[];
  quickActions: QuickAction[];
  panelTitle: string;
  roleLabel: string;
  roleIcon: React.ReactNode;
  profileRoute: string;
  notificationsRoute: string;
  scheduleViewAllRoute: string;
  showProfessor?: boolean;
  onLogout: () => void;
};

export default function DashboardTemplate({
  user,
  unreadCount,
  todaySchedule,
  quickActions,
  panelTitle,
  roleLabel,
  roleIcon,
  profileRoute,
  notificationsRoute,
  scheduleViewAllRoute,
  showProfessor = false,
  onLogout,
}: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark, toggleTheme, t } = useTheme();
  const s = getDashboardStyles(t, width, isDark);

  const getScheduleStatus = useCallback((startTime: string, endTime: string) => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const [sH, sM] = String(startTime || "0:0").split(":").map(Number);
    const [eH, eM] = String(endTime || "0:0").split(":").map(Number);
    const start = sH * 60 + sM;
    const end = eH * 60 + eM;
    if (mins >= start && mins <= end) return "Now";
    if (mins < start) return "Upcoming";
    return "Done";
  }, []);

  const profileUri =
    user.profile && user.profile !== "defaultProfile.png" ? user.profile : null;

  return (
    <View style={s.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header gradient */}
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.headerGradient, { paddingTop: insets.top + 4 }]}
        >
          <View style={s.headerLogoWrap}>
            <Image
              source={require("../assets/images/logo_long.png")}
              style={s.headerLogo}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        <View style={s.contentPadding}>
          {/* Profile row */}
          <View style={s.profileRow}>
            <View style={s.profileRowLeft}>
              <TouchableOpacity
                onPress={() => router.push(profileRoute as any)}
                style={s.profileAvatarBtn}
              >
                <View style={s.profileAvatar}>
                  {profileUri ? (
                    <Image source={{ uri: profileUri }} style={s.profileAvatarImage} />
                  ) : (
                    <View style={s.profileAvatarFallback}>
                      <Ionicons name="person" size={24} color={t.accentBar} />
                    </View>
                  )}
                </View>
                <View style={s.onlineDot} />
              </TouchableOpacity>
              <View style={s.profileTextWrap}>
                <Text style={s.profileTitle}>{panelTitle}</Text>
                <Text style={s.profileSubtitle}>Welcome back, {user.name} 👋</Text>
              </View>
            </View>

            <View style={s.headerActions}>
              <TouchableOpacity onPress={toggleTheme} style={s.themeToggle}>
                <Ionicons
                  name={isDark ? "sunny" : "moon"}
                  size={20}
                  color={isDark ? t.warningIcon : t.accentBar}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(notificationsRoute as any)}
                accessibilityRole="button"
                accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
              >
                <View>
                  <Ionicons name="notifications" size={26} color={t.warningIcon} />
                  {unreadCount > 0 && (
                    <View style={s.badge} importantForAccessibility="no">
                      <Text style={s.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            <View style={s.statsCard}>
              <View style={s.statsIconWrap(palette.blue600)}>
                <Ionicons name="calendar" size={16} color={palette.white} />
              </View>
              <Text style={s.statsValue}>{todaySchedule.length}</Text>
              <Text style={s.statsLabel}>Today Classes</Text>
            </View>
            <View style={s.statsCard}>
              <View style={s.statsIconWrap(palette.yellow400)}>
                <Ionicons name="notifications" size={16} color={palette.white} />
              </View>
              <Text style={s.statsValue}>{unreadCount}</Text>
              <Text style={s.statsLabel}>Unread Alerts</Text>
            </View>
            <View style={s.statsCardGreen}>
              <View style={s.statsIconWrap(palette.green500)}>{roleIcon}</View>
              <Text style={s.statsValue}>{roleLabel}</Text>
              <Text style={s.statsLabel}>Your Role</Text>
            </View>
          </View>

          {/* Today's Schedule */}
          <View style={s.scheduleCard}>
            <View style={s.scheduleHeader}>
              <View style={s.sectionTitleRow}>
                <View style={s.accentBar} />
                <Text style={s.sectionTitle}>Today&apos;s Schedule</Text>
              </View>
              <TouchableOpacity onPress={() => router.push(scheduleViewAllRoute as any)}>
                <Text style={s.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {todaySchedule.length === 0 ? (
              <View style={s.emptyScheduleWrap}>
                <Text style={s.emptyScheduleEmoji}>🗓️</Text>
                <Text style={s.emptyScheduleTitle}>No classes scheduled today</Text>
                <Text style={s.emptyScheduleSubtitle}>Enjoy your free day!</Text>
              </View>
            ) : (
              todaySchedule.map((item, index) => {
                const status = getScheduleStatus(item.startTime, item.endTime);
                return (
                  <View
                    key={index}
                    style={s.scheduleItemRow(index >= todaySchedule.length - 1)}
                  >
                    <Text style={s.scheduleTime}>
                      {item.startTime}-{item.endTime}
                    </Text>
                    <View style={s.scheduleItemContent}>
                      <Text style={s.scheduleCourseName}>
                        {item.course?.title || item.course?.name || item.course?.code || "Course"}
                      </Text>
                      {showProfessor && (
                        <Text style={s.scheduleProf}>
                          Prof: {item.faculty?.name || "Unassigned"}
                        </Text>
                      )}
                      <Text style={s.scheduleRoom}>{item.room}</Text>
                    </View>
                    <View style={s.scheduleBadge(status)}>
                      <Text style={s.scheduleBadgeText}>{status}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Quick Actions */}
          <View style={s.quickActionsSection}>
            <View style={s.quickActionsSectionHeader}>
              <View style={s.accentBar} />
              <Text style={s.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={s.quickActionsGrid}>
              {quickActions.map((action) => (
                <View key={action.label} style={s.quickActionCardWrap}>
                  <Pressable
                    style={({ pressed }) =>
                      s.quickActionPressable(pressed, action.gradient[0])
                    }
                    onPress={() => {
                      haptic.light();
                      router.push(action.route as any);
                    }}
                  >
                    <LinearGradient
                      colors={action.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={s.quickActionGradientBar}
                    />
                    <View style={s.quickActionContent}>
                      <LinearGradient
                        colors={action.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.quickActionIconWrap}
                      >
                        {action.icon}
                      </LinearGradient>
                      <Text style={s.quickActionLabel}>{action.label}</Text>
                      <Text style={s.quickActionSubtitle}>{action.subtitle}</Text>
                      <View style={s.quickActionArrowWrap}>
                        <Ionicons
                          name="arrow-forward"
                          size={13}
                          color={action.gradient[0]}
                        />
                      </View>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Logout */}
          <LinearGradient
            colors={gradients.danger}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.logoutGradient}
          >
            <TouchableOpacity
              style={s.logoutButton}
              onPress={() => {
                haptic.medium();
                onLogout();
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={palette.white}
                style={{ marginRight: 8 }}
              />
              <Text style={s.logoutText}>Logout</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
