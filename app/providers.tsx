"use client";

import { AuthProvider } from "@/lib/context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <SpeedInsights />
    </AuthProvider>
  );
}
