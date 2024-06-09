import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import LiveCursors from "./cursor/live-cursors";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
} from "@/liveblocks.config";
import CursorChat from "./cursor/cursor-chat";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import ReactionSelector from "./reaction/reaction-button";
import FlyingReaction from "./reaction/flying-reaction";
import useInterval from "@/hooks/useInterval";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { shortcuts } from "@/constants";
import Comments from "./comments/comments";

type LiveProps = {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  undo: VoidFunction;
  redo: VoidFunction;
};

export default function Live({ canvasRef, undo, redo }: LiveProps) {
  const broadcast = useBroadcastEvent(); // Use to broadcast my flying reaction

  const [{ cursor }, updateMyPresence] = useMyPresence();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [reaction, setReaction] = useState<Reaction[]>([]);

  // Remove reactions that are no longer visible on screen
  useInterval(() => {
    setReaction((reaction) =>
      reaction.filter((r) => r.timestamp > Date.now() - 4000)
    );
  }, 1000);

  // Every time cursor is pressed (left click) && in Reaction mode, keep adding the selected reaction (cursorState.reaction) to the array.
  // So that we can later map and render it on the <Live/> component
  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReaction((reaction) =>
        reaction.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  //Listening to other users', setReaction if anybody is broadcasting their reaction event.
  useEventListener((eventData) => {
    const event = eventData.event;
    setReaction((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    // Ignore pointer movement while selecting an emoji
    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x; // actual position subtracting position of the cursor relative to the window
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y; // actual position subtracting position of the cursor relative to the window

      updateMyPresence({ cursor: { x, y } });
    }
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      setCursorState((state: CursorState) => {
        if (cursorState.mode === CursorMode.Reaction) {
          return { ...state, isPressed: true };
        } else {
          return state;
        }
      });
    },
    [cursorState.mode, setCursorState]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.stopPropagation();
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x; // actual position subtracting position of the cursor relative to the window
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y; // actual position subtracting position of the cursor relative to the window

      updateMyPresence({ cursor: { x, y } });

      // Check if we are in the Reaction mode, then we'll set a special property called isPressed to true
      setCursorState((state: CursorState) => {
        if (cursorState.mode === CursorMode.Reaction) {
          return { ...state, isPressed: true };
        } else {
          return state;
        }
      });
    },
    [cursorState.mode, setCursorState]
  );

  // Initialize keyboard listeners for Chat mode and Emoji mode
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === `/`) {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === `Escape`) {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === `/`) {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keyup", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const setReactions = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    });
  }, []);

  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Chat":
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
        break;
      case "Reactions":
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
        break;
      case "Undo":
        undo();
        break;
      case "Redo":
        redo();
        break;
    }
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative h-full w-full flex flex-1 justify-center items-center"
      >
        <canvas ref={canvasRef} />

        {reaction.map((r) => (
          <FlyingReaction
            key={r.timestamp.toString()}
            x={r.point.x}
            y={r.point.y}
            timestamp={r.timestamp}
            value={r.value}
          />
        ))}
        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}
        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector setReaction={setReactions} />
        )}
        <LiveCursors />
        <Comments />
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((item) => (
          <ContextMenuItem
            key={item.key}
            onClick={() => handleContextMenuClick(item.name)}
            className="right-menu-item"
          >
            <p>{item.name}</p>
            <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
