import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>VIZJA Smart Campus</title>
        <meta name="description" content="VIZJA University Smart Campus — courses, schedules, grades, and more." />

        {/* Preconnect to API origin to reduce latency on first fetch */}
        <link rel="preconnect" href={process.env.EXPO_PUBLIC_API_URL || ""} />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
