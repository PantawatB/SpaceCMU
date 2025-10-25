"use client"; 

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      console.log("Received token from backend callback:", token);
      try {
         localStorage.setItem('token', token);
         localStorage.removeItem('user');
         console.log("Token stored in localStorage.");
         router.push('/Feeds');
      } catch (error) {
          console.error("Error storing token in localStorage:", error);
           router.push('/Login?error=storage-failed');
      }
    } else {
      console.error("No token received in callback URL.");
      router.push('/Login?error=callback-token-missing');
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing authentication, please wait...</p>
    </div>
  );
}