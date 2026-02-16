"use client";

import LoadingScreen from "@/app/components/LoadingScreen";

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
