"use client";

import LoadingScreen from "@/app/components/LoadingScreenFixed";

type Props = {
  loading: boolean;
  children: React.ReactNode;
};

export default function AuthLoadingWrapper({
  loading,
  children,
}: Props) {
  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
