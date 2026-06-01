"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/app");
  }

  async function register() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Revisa tu email para confirmar la cuenta");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white border rounded-3xl p-10 shadow-lg">

        <h1 className="text-3xl font-bold mb-2">
          Welcome back
        </h1>

        <p className="text-gray-500 mb-8">
          Login to your Six Sigma Macro Tools account
        </p>

        <input
          className="w-full border p-3 rounded-xl mb-4"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded-xl mb-6"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold mb-3 hover:bg-gray-800"
        >
          Login
        </button>

        <button
          onClick={register}
          disabled={loading}
          className="w-full border py-3 rounded-xl font-semibold"
        >
          Create account
        </button>

      </div>
    </div>
  );
}