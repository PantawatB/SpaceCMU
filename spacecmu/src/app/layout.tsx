"use client"; // ต้องมี เพราะใช้ Hooks

import { useState, useEffect } from "react"; // Import Hooks
import { usePathname } from "next/navigation"; // Import usePathname
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalChat from "@/components/GlobalChat"; // Import Component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const NO_CHAT_PAGES = ['/', '/Login', '/Register'];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token); 
    };

    checkAuthStatus(); 

    const handleLogout = () => {
      setIsLoggedIn(false); 
    };

    window.addEventListener('logout', handleLogout); 
    return () => { 
      window.removeEventListener('logout', handleLogout);
    };
  }, []); 

  const shouldShowChat = !NO_CHAT_PAGES.includes(pathname) && isLoggedIn;

  return (
    <>
      {children}
      {shouldShowChat && <GlobalChat />}
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