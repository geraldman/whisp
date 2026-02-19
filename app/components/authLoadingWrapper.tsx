"use client";

import LoadingScreen from "@/app/components/LoadingScreenFixed";

type Props = {
  loading: boolean;
  text?: string;
  children: React.ReactNode;
};

export default function AuthLoadingWrapper({
  loading,
  text,
  children,
}: Props) {
  if (loading) {
    return <LoadingScreen text={text} />;
  }

  return <>{children}</>;
}
