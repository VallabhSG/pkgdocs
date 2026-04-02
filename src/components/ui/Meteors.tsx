"use client";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

export const Meteors = ({
  number = 20,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = useMemo(
    () =>
      Array.from({ length: number }, (_, idx) => ({
        id: idx,
        left: Math.floor(Math.random() * 800 - 400),
        delay: (Math.random() * 0.6 + 0.2).toFixed(2),
        duration: Math.floor(Math.random() * 8 + 4),
      })),
    [number]
  );

  return (
    <>
      {meteors.map(({ id, left, delay, duration }) => (
        <span
          key={id}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-full bg-slate-400 shadow-[0_0_0_1px_#ffffff15] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-slate-400 before:to-transparent",
            className
          )}
          style={{
            top: 0,
            left: `${left}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      ))}
    </>
  );
};
