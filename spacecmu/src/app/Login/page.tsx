"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from '@/utils/apiConfig';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const body = await res.json().catch(() => ({}));
      // support responses like { token, user } and { message, data: { token, user } }
      const payload = body?.data ?? body;

      if (!res.ok) {
        setError(body?.message ?? payload?.message ?? 'Login failed');
        setLoading(false);
        return;
      }

      // store token and user for future requests (support both shapes)
      const token = payload?.token ?? body?.token;
      const user = payload?.user ?? body?.user;

      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('token', token);
      }
      if (typeof window !== 'undefined' && user) {
        try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
      }

      // สำเร็จ -> ไปหน้า Feeds
      router.push('/Feeds');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || 'Login failed');
      else setError('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 relative"> 
      <Link href="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 transition group">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Back to Home
        </span>
      </Link>
      <h1 className="text-2xl font-bold mb-4 mt-16">เข้าสู่ระบบ</h1>
      <form className="flex flex-col gap-4 w-80 mb-8" onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <Link
          href="/Register"
          className="px-6 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition text-center"
        >
          Register
        </Link>
      </form>
    </div>
  );
}