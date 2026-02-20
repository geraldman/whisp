"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/app/components/LoadingScreenFixed";

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth");
  }, [router]);

  return <LoadingScreen />;
}

