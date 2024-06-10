"use client";

import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

type LayoutProviderProps = {
  children: ReactNode;
};

export enum Layout {
  TABS = "tabs",
  SIDEBARS = "sidebars",
}

interface LayoutContext {
  layout: Layout | null;
  setLayout: Dispatch<SetStateAction<Layout | null>>;
}

export const LayoutContext = createContext<LayoutContext>({
  layout: Layout.TABS,
  setLayout: () => {},
});

export default function LayoutProvider({ children }: LayoutProviderProps) {
  const [layout, setLayout] = useState<Layout | null>(Layout.TABS);

  useEffect(() => {
    const currentLayout = window.localStorage.getItem("layout");
    if (!currentLayout) {
      window.localStorage.setItem("layout", Layout.TABS);
    } else {
      if (layout !== currentLayout) {
        window.localStorage.setItem("layout", layout || Layout.TABS);
      }
    }
  }, [layout]);

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}
