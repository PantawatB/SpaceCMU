"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalChat from "@/components/GlobalChat";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Pages where GlobalChat should NOT be displayed
const NO_CHAT_PAGES = ['/', '/Login', '/Register'];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChat = !NO_CHAT_PAGES.includes(pathname);

  return (
    <>
      {children}
      {/* Global chat rendered on pages except Home, Login, and Register */}
      {showChat && <GlobalChat />}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
