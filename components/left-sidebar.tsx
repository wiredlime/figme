"use client";

import { useMemo } from "react";
import Image from "next/image";

import { getShapeInfo } from "@/lib/utils";
import { Icon, Icons } from "./icon";

const LeftSidebar = ({ allShapes }: { allShapes: Array<any> }) => {
  // memoize the result of this function so that it doesn't change on every render but only when there are new shapes
  const memoizedShapes = useMemo(
    () => (
      <section className="flex flex-col border bg-background text-foreground min-w-[227px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20">
        <h3 className="border-b px-5 py-4 text-xs text-foreground font-semibold uppercase">
          Layers
        </h3>
        <div className="flex flex-col">
          {allShapes?.map((shape: any) => {
            const info = getShapeInfo(shape[1]?.type);
            const ShapeIcon = Icons[info.icon as Icon];
            const name = info.name;
            const id = "#" + shape[0].slice(0, 5);
            return (
              <div
                key={shape[1]?.objectId}
                className="group my-1 flex items-center gap-5 px-5 py-2.5 hover:cursor-pointer hover:bg-secondary text-foreground"
              >
                {/* <Image src={info?.icon} alt="Layer" width={16} height={16} /> */}
                <ShapeIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                <h3 className="text-sm capitalize">
                  {name} <span className="text-muted-foreground">{id}</span>
                </h3>
              </div>
            );
          })}
        </div>
      </section>
    ),
    [allShapes?.length]
  );

  return memoizedShapes;
};

export default LeftSidebar;
