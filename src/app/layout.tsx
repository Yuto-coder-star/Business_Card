import type { Metadata } from "next";
import { Noto_Sans_JP, Space_Mono } from "next/font/google";
import "./globals.css";

const primarySans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-geist-sans",
});

const techMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "会計探偵：まるっとケースファイル",
  description:
    "鶴田悠斗と共に数字の謎を追う、3分で楽しめるシネマティックなインタラクティブミステリー。",
  openGraph: {
    title: "会計探偵：まるっとケースファイル",
    description:
      "鶴田悠斗と共に数字の謎を追う、3分で楽しめるシネマティックなインタラクティブミステリー。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${primarySans.variable} ${techMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
