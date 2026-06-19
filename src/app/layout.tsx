import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WDSJL's Gifts",
  description: "创建属于你的互动礼物空间，藏下每一份心意",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${serif.variable} ${sans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
