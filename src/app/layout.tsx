import type { Metadata } from "next";
import "@/styles/globals.css";
import { NavigationProvider } from "@/hooks/useNavigation";

export const metadata: Metadata = {
  title: "NEXUS",
  description: "NEXUS Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavigationProvider>{children}</NavigationProvider>
      </body>
    </html>
  );
}
