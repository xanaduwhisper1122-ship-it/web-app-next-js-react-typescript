import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大大阿卢的拼音修炼手册",
  description: "从笔画输入到拼音输入，每天进步一点点。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
