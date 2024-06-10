import React, { useMemo } from "react";
import styles from "./index.module.css";
import { useOthers, useSelf } from "@/liveblocks.config";
import { Avatar } from "./avatar";
import { generateRandomName } from "@/lib/utils";

function ActiveUsers() {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  // Only change the avatar's color when user list changes
  const memoizedUsers = useMemo(() => {
    return (
      <div className="flex pl-3">
        {users.slice(0, 3).map(({ connectionId, info }) => {
          return (
            <Avatar
              key={connectionId}
              name={generateRandomName()}
              otherStyles="-ml-5"
            />
          );
        })}

        {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}

        {currentUser && (
          <div className="relative">
            <Avatar name="You" />
          </div>
        )}
      </div>
    );
  }, [users.length]);
  return (
    <div className="flex items-center justify-center">{memoizedUsers}</div>
  );
}

export default ActiveUsers;
