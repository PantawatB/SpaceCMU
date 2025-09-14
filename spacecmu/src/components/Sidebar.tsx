"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarMenuItem {
  name: string;
  icon: React.ReactNode;
  link?: string;
}

interface SidebarProps {
  menuItems: SidebarMenuItem[];
}

export default function Sidebar({ menuItems }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="w-64 p-6 flex flex-col justify-between h-screen bg-white">
      <div>
        {/* Logo */}
        <div className="text-2xl font-bold mb-8">⌘</div>
        {/* Menu */}
        <nav className="space-y-3">
          {menuItems.map((item) => (
            item.link ? (
              <Link href={item.link} key={item.name} className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 transition font-medium text-left ${
                pathname === item.link
                  ? "bg-white text-black shadow-md border border-gray-200 font-semibold"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
              }`}>
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span className={pathname === item.link ? "text-base" : "text-sm"}>{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.name}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 transition font-medium text-left text-gray-500 hover:text-black hover:bg-gray-100"
              >
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            )
          ))}
        </nav>
      </div>
      <div className="pt-6">
        <button className="w-full flex items-center gap-3 justify-center bg-black text-white rounded-lg px-3 py-2 font-semibold hover:bg-gray-800">
          <span className="w-5 h-5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path stroke="currentColor" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/><path stroke="currentColor" strokeWidth="2" d="M3 12a9 9 0 0118 0 9 9 0 01-18 0z"/></svg>
          </span>
          <span className="text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
