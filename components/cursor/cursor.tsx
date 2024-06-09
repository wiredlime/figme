import CursorSVG from "@/public/assets/CursorSVG";
import React from "react";

type CursorProps = {
  color: string;
  x: number;
  y: number;
  message: string;
};

export default function Cursor({ color, x, y, message }: CursorProps) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0"
      style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
    >
      <CursorSVG color={color} />
      {message && (
        <div
          className="absolute left-2 top-5 rounded-3xl px-4 py-2"
          style={{ backgroundColor: color }}
        >
          <p className="text-white whitespace-nowrap text-sm leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
