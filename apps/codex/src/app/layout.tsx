import type { Metadata } from "next";
import "@nexus/core/styles/globals.css";
import { NavigationProvider, AuthProvider } from "@nexus/core/hooks";

export const metadata: Metadata = {
  title: "Codex API Docs",
  description: "Professional API documentation for developers",
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
