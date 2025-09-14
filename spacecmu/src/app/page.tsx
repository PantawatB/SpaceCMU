"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
      <h1 className="text-3xl font-bold mb-4">ยินดีต้อนรับสู่เว็บโง่ๆ</h1>
      <p className="mb-8 text-gray-500">นี่คือหน้าแนะนำเว็บแบบง่าย ๆ</p>
      <div className="flex gap-4">
        <Link href="/Login" className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">เข้าสู่ระบบ</Link>
        <Link href="/Register" className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition">สมัครสมาชิก</Link>
      </div>
    </div>
  );
}
