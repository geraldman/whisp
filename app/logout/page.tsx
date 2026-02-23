"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../actions/logout";
import { routes } from "../routes";
import { useAuth } from "@/lib/context/AuthContext";
import LoadingScreen from "@/app/components/LoadingScreenFixed";

export default function LogoutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // 🔥 trigger logout once
  useEffect(() => {
    logout();
  }, []);

  // 🔥 redirect ONLY when auth state confirmed null
  useEffect(() => {
    if (!loading && !user) {
      router.replace(routes.home);
    }
  }, [user, loading, router]);

  return <LoadingScreen mode="logout" />;
}