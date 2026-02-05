"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../actions/logout";
import { routes } from "../routes";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      await logout();
      router.replace(routes.login);
    }
    
    handleLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Logging out...</p>
    </div>
  );
}
