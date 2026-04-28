import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Account Finder",
  description: "Find all accounts linked to your email",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
