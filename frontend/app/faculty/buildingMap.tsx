import { lazy, Suspense } from "react";
import { View } from "react-native";
import { SkeletonList } from "../../components/Skeleton";

const BuildingMapScreen = lazy(() => import("../../components/buildingMapScreen"));

export default function BuildingMap() {
  return (
    <Suspense fallback={<View style={{ flex: 1, padding: 20 }}><SkeletonList rows={4} /></View>}>
      <BuildingMapScreen />
    </Suspense>
  );
}
