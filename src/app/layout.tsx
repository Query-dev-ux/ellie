import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Флирт с AI-девушкой",
  description: "Telegram mini-app для тренировки навыков флирта",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
