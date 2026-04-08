import { useEffect, useRef } from "react";
import { Animated, View, type ViewStyle, type StyleProp } from "react-native";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

function SkeletonBlock({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
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
          backgroundColor: "#e2e8f0",
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        },
        style,
      ]}
    >
      <SkeletonBlock width="60%" height={14} style={{ marginBottom: 12 }} />
      <SkeletonBlock width="100%" height={12} style={{ marginBottom: 8 }} />
      <SkeletonBlock width="80%" height={12} />
    </View>
  );
}

export function SkeletonRow({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", gap: 8, marginBottom: 12 }, style]}>
      <SkeletonBlock width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <SkeletonBlock width="50%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="80%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonStatRow({ count = 3, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", gap: 8, marginBottom: 16 }, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            shadowColor: "#0f172a",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <SkeletonBlock width={40} height={20} style={{ marginBottom: 8 }} />
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
