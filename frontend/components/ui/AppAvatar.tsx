import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../contexts/ThemeContext";
import { palette, radius, space } from "../../styles/tokens";

type AvatarSize = "sm" | "md" | "lg";
type AvatarStatus = "online" | "offline" | "none";

interface AppAvatarProps {
  uri?: string | null;
  initials: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: space[8],   // 32
  md: space[12],  // 48
  lg: space[16],  // 64
};

export function AppAvatar({ uri, initials, size = "md", status = "none" }: AppAvatarProps) {
  const { t } = useTheme();
  const dim = sizeMap[size];
  const dotSize = Math.round(dim * 0.22);
  const fontSize = Math.round(dim * 0.35);

  return (
    <View style={{ width: dim, height: dim }}>
      <View
        style={{
          width: dim,
          height: dim,
          borderRadius: radius.full,
          borderWidth: 2,
          borderColor: t.inputBorderFocus,
          backgroundColor: t.avatarBg,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
        ) : (
          <Text style={{ fontSize, fontWeight: "700", color: t.text }}>
            {initials.slice(0, 2).toUpperCase()}
          </Text>
        )}
      </View>

      {status !== "none" && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: dotSize,
            height: dotSize,
            borderRadius: radius.full,
            backgroundColor: status === "online" ? t.online : palette.slate300,
            borderWidth: 2,
            borderColor: t.bg,
          }}
        />
      )}
    </View>
  );
}
