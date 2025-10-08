import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
