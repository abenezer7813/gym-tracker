"use client";

import Image from "next/image";
import { useState } from "react";

interface ExerciseImageProps {
  url?: string;
  name: string;
  className?: string;
  sizes?: string;
}

export default function ExerciseImage({ url, name, className = "", sizes = "56px" }: ExerciseImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  let safeUrl: string | null = null;

  try {
    const parsed = new URL(url ?? "");
    if (parsed.protocol === "https:" || parsed.protocol === "http:") safeUrl = parsed.href;
  } catch {
    safeUrl = null;
  }

  const showImage = safeUrl && failedUrl !== safeUrl;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-3 text-sm font-bold text-text-dim ${className}`}
      role={showImage ? undefined : "img"}
      aria-label={showImage ? undefined : `${name || "Exercise"} image unavailable`}
    >
      {showImage && safeUrl ? (
        <Image
          src={safeUrl}
          alt={`${name || "Exercise"} demonstration`}
          fill
          sizes={sizes}
          unoptimized
          className="object-cover"
          onError={() => setFailedUrl(safeUrl)}
        />
      ) : (
        name.trim().charAt(0).toUpperCase() || "?"
      )}
    </div>
  );
}