"use client";

import Image from "next/image";
import { useState } from "react";

interface CountryFlagProps {
  code: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { width: 24, height: 18, className: "w-6 h-[18px]" },
  md: { width: 40, height: 30, className: "w-10 h-[30px]" },
  lg: { width: 64, height: 48, className: "w-16 h-12" },
};

export default function CountryFlag({ code, size = "md" }: CountryFlagProps) {
  const [hasError, setHasError] = useState(false);
  const { width, height, className } = sizeMap[size];

  if (hasError || !code) {
    return (
      <div
        className={`${className} rounded bg-white/10 flex items-center justify-center text-xs text-gray-400 font-mono`}
      >
        {code ? code.toUpperCase() : "??"}
      </div>
    );
  }

  return (
    <Image
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      alt={`${code.toUpperCase()} flag`}
      width={width}
      height={height}
      className={`${className} rounded shadow-sm object-cover`}
      onError={() => setHasError(true)}
    />
  );
}
