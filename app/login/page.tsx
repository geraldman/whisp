"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions/auth";
import { routes } from "@/app/routes";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.replace(routes.chats);
    return null;
  }

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // Wait a bit for auth state to propagate
        await new Promise(resolve => setTimeout(resolve, 500));
        router.replace(routes.chats);
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err: any) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
