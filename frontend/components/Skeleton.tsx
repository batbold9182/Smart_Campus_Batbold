import { useEffect, useRef } from "react";
import { Animated, View, type ViewStyle, type StyleProp } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { motion, radius, space } from "../styles/tokens";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

function SkeletonBlock({ width = "100%", height = 16, borderRadius = radius.sm, style }: SkeletonProps) {
  const { t } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: motion.slower, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: motion.slower, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: t.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: radius.md,
          padding: space[4],
          marginBottom: space[3],
          shadowColor: t.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        },
        style,
      ]}
    >
      <SkeletonBlock width="60%" height={14} style={{ marginBottom: space[3] }} />
      <SkeletonBlock width="100%" height={12} style={{ marginBottom: space[2] }} />
      <SkeletonBlock width="80%" height={12} />
    </View>
  );
}

export function SkeletonRow({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", gap: space[2], marginBottom: space[3] }, style]}>
      <SkeletonBlock width={48} height={48} borderRadius={radius.full} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <SkeletonBlock width="50%" height={14} style={{ marginBottom: space[2] }} />
        <SkeletonBlock width="80%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonStatRow({ count = 3, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  const { t } = useTheme();
  return (
    <View style={[{ flexDirection: "row", gap: space[2], marginBottom: space[4] }, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: t.surface,
            borderRadius: radius.md,
            padding: space[4],
            alignItems: "center",
            shadowColor: t.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <SkeletonBlock width={40} height={20} style={{ marginBottom: space[2] }} />
          <SkeletonBlock width="70%" height={10} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonList({ rows = 4, style }: { rows?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

export default SkeletonBlock;
