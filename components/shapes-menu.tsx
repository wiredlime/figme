"use client";

import { ShapesMenuProps } from "@/types/type";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Icon, Icons } from "./icon";
import { cn } from "@/lib/utils";

const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
  isActive,
}: ShapesMenuProps) => {
  const isDropdownElem = item.value.some(
    (elem) => elem?.value === activeElement.value
  );
  const Icon = Icons[item.icon as Icon];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-ring">
          <Button
            variant="ghost"
            onClick={() => handleActiveElement(item)}
            className={cn({ "bg-accent": isActive })}
          >
            <Icon className="w-4 h-4 shrink-0 text-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="mt-2 flex flex-col gap-y-1 p-0 border-none text-foreground bg-secondary/20 backdrop-blur-md">
          {item.value.map((elem) => {
            const ItemIcon = Icons[elem?.icon as Icon];
            return (
              <Button
                key={elem?.name}
                variant="ghost"
                onClick={() => {
                  handleActiveElement(elem);
                }}
                className={`flex h-fit justify-between gap-10 rounded-none px-5 py-3 focus:border-none text-foreground ${
                  activeElement.value === elem?.value
                    ? "bg-accent"
                    : "hover:bg-gray-200/50"
                }`}
              >
                <div className="group flex items-center gap-5">
                  <ItemIcon className="w-4 h-4 shrink-0 text-foreground" />
                  <p className={`text-sm text-foreground`}>{elem?.name}</p>
                </div>
              </Button>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        className="hidden"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </>
  );
};

export default ShapesMenu;
