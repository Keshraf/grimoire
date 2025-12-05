import type { Metadata } from "next";
import "@nexus/core/styles/globals.css";
import { NavigationProvider, AuthProvider } from "@nexus/core/hooks";

export const metadata: Metadata = {
  title: "Arcana",
  description:
    "A mystical knowledge base exploring consciousness and creativity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavigationProvider>{children}</NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
