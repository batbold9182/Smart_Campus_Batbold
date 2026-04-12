import * as Haptics from "expo-haptics";

/** Thin wrappers around expo-haptics for consistent micro-interaction feedback. */
export const haptic = {
  /** Subtle tap — button presses, navigation, card taps */
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  /** Noticeable tap — confirms an action */
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  /** Completion — form submitted successfully */
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  /** Validation / submission error */
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  /** Toggle flipped, option selected */
  selection: () => Haptics.selectionAsync(),
};
