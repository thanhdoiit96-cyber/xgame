import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ai Lạc Quẻ?",
  description: "Trò tìm người lạc quẻ cho nhóm 3–5 người. Vào nhanh bằng mã phòng.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
