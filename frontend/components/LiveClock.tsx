import { useEffect, useState } from "react";
import { Text, type TextProps } from "react-native";

type LiveClockProps = TextProps & {
  format?: (date: Date) => string;
};

const defaultFormat = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/**
 * Renders a live clock that updates every second.
 * Only the clock re-renders — the parent component is unaffected.
 */
export default function LiveClock({ format = defaultFormat, style, ...rest }: LiveClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Text style={style} {...rest}>
      {format(time)}
    </Text>
  );
}
