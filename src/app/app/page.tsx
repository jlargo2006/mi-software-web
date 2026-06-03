"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    }

    checkUser();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <p className="mb-6 text-gray-600">
        Has iniciado sesión correctamente.
      </p>

      <button
        onClick={logout}
        className="bg-black text-white px-6 py-3 rounded-xl"
      >
        Logout
      </button>
    </div>
  );
}