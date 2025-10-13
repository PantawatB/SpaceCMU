"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import ChatWindow from '@/components/ChatWindow';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "/noobcat.png" // default preview image
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // TODO: API call to create product
    console.log("Product data:", formData);
    // After successful API call:
    // setIsModalOpen(false);
    // setFormData({ name: "", description: "", price: "", image: "/noobcat.png" });
  };

  // prevent page layout shift and stop body scrolling when modal is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (isModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth) document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
    }

    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
    };
  }, [isModalOpen]);

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
    <div className="flex h-screen bg-white text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} />
      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col">
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
        {/* Header with Markets title and Add Product button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Markets</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </button>
        </div>
        {/* Market Cards Grid (scrollable area) */}
        <div className="flex-1 overflow-auto pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-8">
            {marketItems.map((item, idx) => (
              <MarketCard key={idx} price={item.price} title={item.title} jobTitle={item.jobTitle} image={item.image} sellerName={item.sellerName} sellerImage={item.sellerImage} />
            ))}
          </div>
        </div>
      </main>
      {/* Chat Window */}
      <div className="h-full">
        <ChatWindow />
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal Content */}
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side - Preview Card */}
              <div className="md:w-1/2 bg-gray-50 p-8 flex items-center justify-center border-r border-gray-200">
                <div className="w-full max-w-[280px]">
                  <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">Preview</h3>
                  <article className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col" style={{ minHeight: 350 }}>
                    {/* Product Image */}
                    <div className="w-full h-[160px]">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        width={300}
                        height={160}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    </div>
                    {/* Card Content */}
                    <div className="flex-1 flex flex-col justify-between p-4 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                          {formData.name || "Product Name"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {formData.description || "Product description will appear here..."}
                        </p>
                        <span className="text-sm font-semibold text-orange-600 block mb-3">
                          {formData.price ? `฿${formData.price}` : "฿0"}
                        </span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8">
                              <Image
                                src="/tanjiro.jpg"
                                alt="You"
                                width={32}
                                height={32}
                                className="rounded-full object-cover aspect-square border border-gray-200 w-full h-full"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">You</span>
                          </div>
                          <button className="bg-black text-white rounded-xl px-4 py-2 text-sm font-medium">
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="md:w-1/2 p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add Product</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Product Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price (฿)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Image Upload Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-10 h-10 mx-auto mb-2 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <p className="text-sm text-gray-500">Click to upload image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-6 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
