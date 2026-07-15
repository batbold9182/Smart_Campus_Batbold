import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { Image, ImageSourcePropType, Pressable, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { getBuildingMapStyles } from "../styles/components_style/buildingMapStyles";

type FloorPlan = {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
};

const FLOOR_PLANS: FloorPlan[] = [
  {
    id: "6",
    title: "6",
    subtitle: "Offices",
    image: require("../assets/images/pietro_6.png"),
  },
  {
    id: "5",
    title: "5",
    subtitle: "Floor 5",
    image: require("../assets/images/pietro_5.png"),
  },
  {
    id: "4",
    title: "4",
    subtitle: "Floor 4",
    image: require("../assets/images/pietro_4.png"),
  },
  {
    id: "3",
    title: "3",
    subtitle: "Floor 3",
    image: require("../assets/images/pietro_3.png"),
  },
  {
    id: "2",
    title: "2",
    subtitle: "Floor 2",
    image: require("../assets/images/pietro_2.png"),
  },
  {
    id: "1",
    title: "1",
    subtitle: "Canteen",
    image: require("../assets/images/1Canteen.png"),
  },
  {
    id: "0",
    title: "0",
    subtitle: "Entrance",
    image: require("../assets/images/entrance.png"),
  },
];

export default function BuildingMapScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [selectedFloorId, setSelectedFloorId] = useState("4");
  const { isDark, t, toggleTheme } = useTheme();

  const s = getBuildingMapStyles(t, isWide, isDark);

  const selectedFloor = useMemo(
    () => FLOOR_PLANS.find((floor) => floor.id === selectedFloorId) ?? FLOOR_PLANS[0],
    [selectedFloorId]
  );

  // ── Pinch / pan / double-tap zoom for the floor plan ──
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = useCallback(() => {
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]);

  // Reset zoom whenever a different floor is selected.
  useEffect(() => {
    resetZoom();
  }, [selectedFloorId, resetZoom]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      "worklet";
      const next = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(next, 1), 4);
    })
    .onEnd(() => {
      "worklet";
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((event) => {
      "worklet";
      if (scale.value <= 1) return;
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      "worklet";
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      "worklet";
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleBackToDashboard = () => {
    if (pathname.startsWith("/admin")) {
      router.push("/admin/dashboard");
      return;
    }

    if (pathname.startsWith("/faculty")) {
      router.push("/faculty/dashboard");
      return;
    }

    router.push("/student/dashboard");
  };

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <View style={s.rootRow}>
        <View style={s.sidebar}>
          <Text style={s.sidebarTitle}>Building Plan</Text>
          <Text style={s.sidebarSubtitle}>Select floor</Text>

          <ScrollView
            horizontal={!isWide}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
          >
            {FLOOR_PLANS.map((floor) => {
              const active = floor.id === selectedFloorId;

              return (
                <Pressable
                  key={floor.id}
                  onPress={() => setSelectedFloorId(floor.id)}
                  style={[s.floorBtn, s.floorBtnDynamic(active)]}
                >
                  <Text style={s.floorBtnTitle(active)}>{floor.title}</Text>
                  <Text style={s.floorBtnSub(active)}>{floor.subtitle}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={s.contentArea}>
          <View style={s.topBar}>
            <Text style={s.topBarTitle}>Floor {selectedFloor.id}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity onPress={toggleTheme} style={s.themeToggle}>
                <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#facc15" : "#0f766e"} />
              </TouchableOpacity>
              <Pressable onPress={handleBackToDashboard} style={s.backButton}>
                <Text style={s.backButtonText}>Back to Dashboard</Text>
              </Pressable>
            </View>
          </View>

          <View style={s.imageWrap}>
            <GestureDetector gesture={composedGesture}>
              <Animated.View style={[s.image, animatedImageStyle]}>
                <Image
                  source={selectedFloor.image}
                  resizeMode="contain"
                  style={s.imageInner}
                />
              </Animated.View>
            </GestureDetector>
            <View style={s.zoomHint} pointerEvents="none">
              <Text style={s.zoomHintText}>Pinch or double-tap to zoom</Text>
            </View>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
