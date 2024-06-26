"use client";

import { memo } from "react";

import { navElements } from "@/constants";
import { ActiveElement, NavbarProps } from "@/types/type";

import ShapesMenu from "./shapes-menu";
import ActiveUsers from "./users/active-users";
import { NewThread } from "./comments/new-thread";
import { Button } from "./ui/button";
import { Icon, Icons } from "./icon";
import { Separator } from "./ui/separator";
import LayoutSetting from "./layout-setting";
import { cn } from "@/lib/utils";

const Navbar = ({
  activeElement,
  imageInputRef,
  handleImageUpload,
  handleActiveElement,
}: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) &&
      value.some((val) => val?.value === activeElement?.value));

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-background p-2 border">
      <ul className="flex flex-row gap-2">
        {navElements.map((item: ActiveElement | any) => {
          const Icon = Icons[item.icon as Icon];
          return (
            <li
              key={item.name}
              onClick={() => {
                if (Array.isArray(item.value)) return;
                handleActiveElement(item);
              }}
              className={cn(
                `group flex justify-center items-center rounded-md`
              )}
            >
              {/* If value is an array means it's a nav element with sub options
            i.e., dropdown */}
              {Array.isArray(item.value) ? (
                <>
                  <Separator orientation="vertical" className="mr-2" />
                  <ShapesMenu
                    item={item}
                    activeElement={activeElement}
                    imageInputRef={imageInputRef}
                    handleActiveElement={handleActiveElement}
                    handleImageUpload={handleImageUpload}
                    isActive={isActive(item.value)}
                  />
                </>
              ) : item?.value === "comments" ? (
                // If value is comments, trigger the NewThread component
                <NewThread>
                  <Button
                    variant="ghost"
                    className={cn({ "bg-accent": isActive(item.value) })}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-secondary-foreground" />
                  </Button>
                </NewThread>
              ) : (
                <Button
                  variant="ghost"
                  className={cn({ "bg-accent": isActive(item.value) })}
                >
                  <Icon className="w-4 h-4 shrink-0 text-secondary-foreground" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="h-[40px] flex items-center gap-2">
        <ActiveUsers />
        <Separator orientation="vertical" />
        <LayoutSetting />
      </div>
    </nav>
  );
};

export default memo(
  Navbar,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
