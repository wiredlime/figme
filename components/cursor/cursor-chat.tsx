import CursorSVG from "@/public/assets/CursorSVG";
import { CursorChatProps, CursorMode } from "@/types/type";
import React from "react";

type Props = {};

export default function CursorChat({
  cursor,
  cursorState,
  setCursorState,
  updateMyPresence,
}: CursorChatProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update out presence by adding a message to it
    updateMyPresence({ message: e.target.value });
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: e.target.value,
    });
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCursorState({
        mode: CursorMode.Chat,
        previousMessage: cursorState.message,
        message: "",
      });
    } else if (e.key === "Escape") {
      setCursorState({
        mode: CursorMode.Hidden,
      });
    }
  };
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
      }}
    >
      {cursorState.mode === CursorMode.Chat && (
        <>
          <CursorSVG color="#000" />
          <div
            onKeyUp={(e) => e.stopPropagation()} // Prevent keyboard event from propagate to <Live/> and activate other Chat mode. Only focusing on typing the chat input
            className="absolute left-2 top-5 bg-blue-400 px-4 py-2 text-sm leading-relaxed text-white rounded-[20px]"
          >
            {cursorState.previousMessage && (
              <div>{cursorState.previousMessage}</div>
            )}
            <input
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder={
                cursorState.previousMessage ? "" : "Type a message ..."
              }
              value={cursorState.message}
              maxLength={50}
              className="z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
