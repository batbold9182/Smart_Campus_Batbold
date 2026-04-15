import { useMemo, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { Image, ImageSourcePropType, Pressable, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
                <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#facc15" : "#6b21a8"} />
              </TouchableOpacity>
              <Pressable onPress={handleBackToDashboard} style={s.backButton}>
                <Text style={s.backButtonText}>Back to Dashboard</Text>
              </Pressable>
            </View>
          </View>

          <View style={s.imageWrap}>
            <Image
              source={selectedFloor.image}
              resizeMode="contain"
              style={{ width: "100%", height: "100%", aspectRatio: 4 / 3 }}
            />
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
