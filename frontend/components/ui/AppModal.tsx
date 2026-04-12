import { Modal, Pressable, Text, type ModalProps } from "react-native";

type Layout = "bottom" | "center";

interface AppModalProps extends Omit<ModalProps, "transparent" | "animationType"> {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the backdrop is pressed or back button is pressed */
  onClose: () => void;
  /** Modal title (optional) */
  title?: string;
  /** Presentation style */
  layout?: Layout;
  /** Override inner container className */
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
  const wrapperCls =
    layout === "bottom"
      ? "flex-1 items-center justify-end bg-black/40 px-4 pb-6"
      : "flex-1 items-center justify-center bg-black/50 px-5";

  const innerCls =
    className ??
    (layout === "bottom"
      ? "max-h-[70%] w-full rounded-2xl bg-app-surface p-4"
      : "w-full rounded-2xl bg-app-surface p-5");

  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose} {...rest}>
      <Pressable className={wrapperCls} onPress={onClose}>
        <Pressable className={innerCls} onPress={() => {}}>
          {title && (
            <Text className="mb-3 text-[18px] font-bold text-app-text">{title}</Text>
          )}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
