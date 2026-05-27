import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Textbook Generator",
  description: "自動生成された教材を閲覧・演習する",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
