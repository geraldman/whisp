"use client";

import Link from "next/link";
import { routes } from "./routes";
import { useAuth } from "@/lib/context/AuthContext";
import LoadingScreen from "./components/LoadingScreen";

function page(){
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <div className="w-screen h-screen flex flex-col items-center justify-center gap-10">
    <h1>Hello Whisp</h1>
    <div className="flex flex-row gap-10">
      {user ? (
        <Link href={routes.chats}>
          <button>Open Chat</button>
        </Link>
      ) : (
        <>
          <Link href={routes.login}>
            <button>Login</button>
          </Link>
          <Link href={routes.register}>
            <button>Register</button>
          </Link>
        </>
      )}
    </div>
  </div>
}

export default page;