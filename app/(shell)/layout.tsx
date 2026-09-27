"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getProfile } from "@/lib/storage";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    if (!profile) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen bg-bg" />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-md pb-28">{children}</div>
      <BottomNav />
    </div>
  );
}
