import type { Metadata } from "next";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "QuoteCompare",
    template: "%s | QuoteCompare",
  },
  description: "A procurement decision workspace for structured quotation comparison.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
