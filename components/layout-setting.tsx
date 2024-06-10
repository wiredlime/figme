"use client";
import { useContext, useMemo } from "react";
import { Icons } from "./icon";
import { Button } from "./ui/button";
import { Layout, LayoutContext } from "./layout-provider";

const LayoutSetting = () => {
  const { layout, setLayout } = useContext(LayoutContext);

  const button = useMemo(() => {
    const handleChangeLayout = (layout: Layout) => {
      setLayout(layout);
    };

    if (layout === Layout.SIDEBARS) {
      return (
        <Button variant="ghost" onClick={() => handleChangeLayout(Layout.TABS)}>
          <Icons.LayoutPanelTop className="w-4 h-4" />
        </Button>
      );
    } else {
      return (
        <Button
          variant="ghost"
          onClick={() => handleChangeLayout(Layout.SIDEBARS)}
        >
          <Icons.LayoutPanelLeft className="w-4 h-4" />
        </Button>
      );
    }
  }, [layout, setLayout]);

  return button;
};

export default LayoutSetting;
