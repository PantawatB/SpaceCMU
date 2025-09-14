import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
      <h1 className="text-2xl font-bold mb-4">สมัครสมาชิก</h1>
      <p className="mb-8 text-gray-500">หน้านี้คือ Register แบบโง่ ๆ</p>
      <Link href="/Feeds" className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">Register</Link>
    </div>
  );
}
