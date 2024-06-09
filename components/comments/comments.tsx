"use client";
import { ClientSideSuspense } from "@liveblocks/react";
import { CommentsOverlay } from "@/components/comments/comments-overlay";

const Comments = () => (
  <ClientSideSuspense fallback={null}>
    {() => <CommentsOverlay />}
  </ClientSideSuspense>
);

export default Comments;
