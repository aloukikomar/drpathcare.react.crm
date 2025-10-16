"use client";

import { ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authContext) return;
    if (!authContext.user) {
      router.push("/auth/sign-in-otp");
    } else {
      setLoading(false);
    }
  }, [authContext?.user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
