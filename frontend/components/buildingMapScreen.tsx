import { useMemo, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { Image, ImageSourcePropType, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const selectedFloor = useMemo(
    () => FLOOR_PLANS.find((floor) => floor.id === selectedFloorId) ?? FLOOR_PLANS[0],
    [selectedFloorId]
  );

  const handleBackToDashboard = () => {
    if (pathname.startsWith("/(admin)")) {
      router.push("/(admin)/dashboard");
      return;
    }

    if (pathname.startsWith("/(faculty)")) {
      router.push("/(faculty)/dashboard");
      return;
    }

    router.push("/(student)/dashboard");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#DCDCDC]" edges={["top"]}>
      <View className={`flex-1 ${isWide ? "flex-row" : ""}`}>
        <View className={`${isWide ? "w-[160px] border-r border-[#CFCFCF] bg-[#EFEFEF] px-3 py-4" : "px-4 pb-2 pt-3"}`}>
          <Text className="text-[18px] font-bold text-black">Building Plan</Text>
          <Text className="mt-1 text-[12px] text-[#4B5563]">Select floor</Text>

          <ScrollView
            horizontal={!isWide}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            className={isWide ? "mt-4" : "mt-3"}
            contentContainerClassName={isWide ? "gap-2 pb-6" : "gap-2 pr-2"}
          >
            {FLOOR_PLANS.map((floor) => {
              const active = floor.id === selectedFloorId;

              return (
                <Pressable
                  key={floor.id}
                  onPress={() => setSelectedFloorId(floor.id)}
                  className={`${isWide ? "w-full" : "min-w-[90px]"} rounded-xl border px-3 py-2 ${
                    active ? "border-black bg-black" : "border-[#D1D5DB] bg-white"
                  }`}
                >
                  <Text className={`text-center text-[20px] font-bold ${active ? "text-white" : "text-black"}`}>{floor.title}</Text>
                  <Text className={`text-center text-[11px] ${active ? "text-[#E5E7EB]" : "text-[#6B7280]"}`}>{floor.subtitle}</Text>
                </Pressable>

              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1 bg-[#DCDCDC] p-3">
          <View className="mb-2 flex-row items-center justify-between gap-2 rounded-xl bg-black px-3 py-2">
            <Text className="text-[16px] font-bold text-white">Floor {selectedFloor.id}</Text>
            <Pressable onPress={handleBackToDashboard} className="rounded-lg bg-white px-3 py-1.5">
              <Text className="text-[12px] font-semibold text-black">Back to Dashboard</Text>
            </Pressable>
          </View>

          <View className="flex-1 items-center justify-center rounded-xl bg-[#DCDCDC]">
            <Image
              source={selectedFloor.image}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
