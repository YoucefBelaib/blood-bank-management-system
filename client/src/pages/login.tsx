import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
    await login(username, password);
    setLocation("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={submit} className="w-full max-w-md bg-[#FFEEF0] p-8 rounded-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-[#A30000]">Sign in</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <div className="mb-3">
          <label className="block text-sm mb-1">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 rounded-md" />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded-md" />
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-[#A30000] text-white px-4 py-2 rounded-md">Sign in</button>
          <Link href="/signup" className="text-sm text-[#A30000]">Create account</Link>
        </div>
      </form>
    </div>
  );
}
