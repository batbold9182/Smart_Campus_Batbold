import { useWindowDimensions } from "react-native";

type Breakpoint = "sm" | "md" | "lg" | "xl";

type ResponsiveInfo = {
  width: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  columns: 1 | 2 | 3 | 4;
};

export default function useResponsive(): ResponsiveInfo {
  const { width } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= 1200 ? "xl" : width >= 900 ? "lg" : width >= 600 ? "md" : "sm";

  const isMobile = breakpoint === "sm";
  const isTablet = breakpoint === "md";
  const isDesktop = breakpoint === "lg" || breakpoint === "xl";

  const columns: 1 | 2 | 3 | 4 =
    breakpoint === "xl" ? 4 : breakpoint === "lg" ? 3 : breakpoint === "md" ? 2 : 1;

  return { width, breakpoint, isMobile, isTablet, isDesktop, columns };
}
