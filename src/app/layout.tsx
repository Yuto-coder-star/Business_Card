import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-jp-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "会計探偵：まるっとケースファイル",
  description:
    "鶴田 悠斗と一緒に数字の違和感を追いかける3分間のインタラクティブ・ミステリーゲーム。",
  openGraph: {
    title: "会計探偵：まるっとケースファイル",
    description:
      "Marutto会計事務所で繰り広げられるシネマティックな会計ミステリーを体験。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "会計探偵：まるっとケースファイル",
    description:
      "数字の影に潜む違和感を暴く、体験型ショートミステリーゲーム。",
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
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
