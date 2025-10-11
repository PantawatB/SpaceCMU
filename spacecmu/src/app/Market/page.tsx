"use client";

import React from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";

// MarketCard component
type MarketCardProps = {
  price: string;
  title: string;
  jobTitle: string;
  image: string;
  sellerName: string;
  sellerImage: string;
};

function MarketCard({ price, title, jobTitle, image, sellerName, sellerImage }: MarketCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-md w-full max-w-[300px] mx-auto mb-8 border border-gray-100 flex flex-col" style={{ minHeight: 350 }}>
      {/* Product Image */}
      <div className="w-full h-[160px]">
        <Image src={image} alt={title} width={300} height={160} className="w-full h-full object-cover rounded-t-xl" />
      </div>
      {/* Card Content */}
      <div className="flex-1 flex flex-col justify-between p-4 pb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{title}</h3>
          <p className="text-sm text-gray-500 mb-2 whitespace-pre-line">{jobTitle}</p>
          <span className="text-sm font-semibold text-orange-600 block mb-3">{price}</span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <Image src={sellerImage} alt={sellerName} width={32} height={32} className="rounded-full object-cover aspect-square border border-gray-200 w-full h-full" />
              </div>
              <span className="text-sm font-medium text-gray-700">{sellerName}</span>
            </div>
            <button className="card__btn bg-black text-white rounded-xl px-4 py-2 text-sm font-medium">Chat</button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MarketMainPage() {
  const menuItems = [
    {
      name: "Profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M4 20c0-4 4-6 8-6s8 2 8 6"
            fill="none"
          />
        </svg>
      ),
      link: "/Profile",
    },
    {
      name: "Feeds",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <rect
            x="4"
            y="6"
            width="16"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path stroke="currentColor" strokeWidth="2" d="M4 10h16" />
        </svg>
      ),
      link: "/Feeds",
    },
    {
      name: "Market",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M3 9l1 10a2 2 0 002 2h12a2 2 0 002-2l1-10"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M5 9V7a7 7 0 0114 0v2"
            fill="none"
          />
        </svg>
      ),
      link: "/Market",
    },
    {
      name: "Friends",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <circle
            cx="8"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="16"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M2 20c0-3 3-5 6-5s6 2 6 5"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M12 20c0-3 3-5 6-5s6 2 6 5"
            fill="none"
          />
        </svg>
      ),
      link: "/Friends",
    },
    {
      name: "Setting",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          />
        </svg>
      ),
      link: "/Setting",
    },
  ];

  // mock data เพิ่ม sellerName, sellerImage
  const marketItems = [
    { price: "฿450", title: "รองเท้าแตะ", jobTitle: "รองเท้าแตะ 2 ข้าง ฟหกดฟหกดหฟกดหฟกดหฟฟหกดฟหกดฟหกดฟหกดฟหก", image: "/shoe.webp", sellerName: "Kamado Tanjiro", sellerImage: "/tanjiro.jpg" },
    { price: "฿80", title: "โทรศัพท์", jobTitle: "iphone ฟหกดหกดฟหกดฟหฟหกดหฟกดกดหฟดหฟดฟห", image: "/iphone.jpg", sellerName: "Nezuko Kamado", sellerImage: "/nezuko.jpg" },
    { price: "฿70", title: "กาแฟ", jobTitle: "ฟหกดฟหกดฟกดฟหกดฟหกดหฟดฟหกดหฟกดหฟดฟหด", image: "/coffee.jpeg", sellerName: "Zenitsu Agatsuma", sellerImage: "/zenitsu.jpg" },
    { price: "฿300", title: "รถบรรทุก", jobTitle: "ฟหกดานราืนรสาหฟนากสฟราสาฟรฟนาหนรกสานรฟหกด", image: "/toy.webp", sellerName: "Inosuke Hashibira", sellerImage: "/inosuke.jpeg" },
    { price: "฿400", title: "ยาสีฟัน", jobTitle: "ฟหกนดร่นฟรห่กดนรฟหนกยรด่ฟหนรกด่ยฟหนกร่ดฟหกนรด่ฟหยนดร่", image: "/tt.webp", sellerName: "Giyu Tomioka", sellerImage: "/giyu.webp" },
    { price: "฿150", title: "กาน้ำร้อน", jobTitle: "หฟกดร้ฟหนรนร้สไฟหกดฟห่กดฟาสดนานรฟห้สาก่นรฟห่นดรา", image: "/kk.jpg", sellerName: "Shinobu Kocho", sellerImage: "/shinobu.jpg" },
    { price: "฿120", title: "ตุ๊กตาหมี", jobTitle: "ฟหกดฟหดฟหกดฟหกดนหฟกรดฟหบกดฟหกดฟหกดฟหกด", image: "/bear.webp", sellerName: "Kyojuro Rengoku", sellerImage: "/kyojuro.jpg" },
    { price: "฿200", title: "ปลากระป๋อง", jobTitle: "ฟหสกด้่ฟหรก้ดนหฟร้กดนฟหกร้ดฟหนยกรด้ฟหกนดร้หฟด", image: "/fishcan.jpg", sellerName: "Mitsuri Kanroji", sellerImage: "/mitsuri.webp" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} />
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-3 py-2 rounded-full bg-white text-sm placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-6">Markets</h1>
        {/* Market Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {marketItems.map((item, idx) => (
            <MarketCard key={idx} price={item.price} title={item.title} jobTitle={item.jobTitle} image={item.image} sellerName={item.sellerName} sellerImage={item.sellerImage} />
          ))}
        </div>
      </main>
    </div>
  );
}
