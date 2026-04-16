import { lazy, Suspense } from "react";
import { View } from "react-native";
import { SkeletonList } from "../../components/Skeleton";

const ChatBotScreen = lazy(() => import("../../components/ChatBotScreen"));

export default function ChatBot() {
  return (
    <Suspense fallback={<View style={{ flex: 1, padding: 20 }}><SkeletonList rows={4} /></View>}>
      <ChatBotScreen />
    </Suspense>
  );
}
