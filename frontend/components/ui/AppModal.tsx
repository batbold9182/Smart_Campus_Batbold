import { Modal, Pressable, Text, View, TouchableOpacity, type ModalProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { radius } from "../../styles/tokens";

type Layout = "bottom" | "center";

interface AppModalProps extends Omit<ModalProps, "transparent" | "animationType"> {
  open: boolean;
  onClose: () => void;
  title?: string;
  layout?: Layout;
  className?: string;
  children: React.ReactNode;
}

export function AppModal({
  open,
  onClose,
  title,
  layout = "bottom",
  className,
  children,
  ...rest
}: AppModalProps) {
  const { t } = useTheme();

  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose} {...rest}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: t.glassOverlay,
          alignItems: "center",
          justifyContent: layout === "bottom" ? "flex-end" : "center",
          paddingHorizontal: layout === "bottom" ? 16 : 20,
          paddingBottom: layout === "bottom" ? 24 : 0,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            width: "100%",
            maxHeight: layout === "bottom" ? "70%" : undefined,
            borderRadius: radius.xl,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.cardBorder,
            padding: layout === "bottom" ? 16 : 20,
          }}
          onPress={() => {}}
        >
          {/* Drag handle for bottom sheet */}
          {layout === "bottom" && (
            <View
              style={{
                width: 32,
                height: 3,
                borderRadius: radius.full,
                backgroundColor: t.divider,
                alignSelf: "center",
                marginBottom: 12,
              }}
            />
          )}

          {/* Header row for center modal */}
          {layout === "center" && (title || true) && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: title ? 12 : 0 }}>
              {title ? (
                <Text style={{ fontSize: 18, fontWeight: "bold", color: t.text, flex: 1 }}>
                  {title}
                </Text>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={t.muted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Title for bottom sheet */}
          {layout === "bottom" && title && (
            <Text style={{ fontSize: 18, fontWeight: "bold", color: t.text, marginBottom: 12 }}>
              {title}
            </Text>
          )}

          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
