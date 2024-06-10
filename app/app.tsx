"use client";
import LeftSidebar from "@/components/left-sidebar";
import Live from "@/components/live";
import NavBar from "@/components/nav-bar";
import RightSidebar from "@/components/right-sidebar";
import { useContext, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvaseMouseMove,
  handlePathCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvas";
import { ActiveElement, Attributes } from "@/types/type";
import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";
import { defaultNavElement } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, LayoutContext } from "@/components/layout-provider";

export default function Page() {
  const { layout } = useContext(LayoutContext);
  const redo = useRedo();
  const undo = useUndo();
  // Store data in key-value stores that will be synced to other users, (subscription mechanism)
  const canvasObjects = useStorage((root) => root.canvasObjects);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);

  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const activeObjectRef = useRef<fabric.Object | null>(null); // To control and remember the selected element
  const imageInputRef = useRef<HTMLInputElement>(null); // To control the input the element that used to upload the images to the canvas
  const isEditingRef = useRef(false);

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontWeight: "",
    fontSize: "",
    fontFamily: "",
    fill: "#ddccff",
    stroke: "#ddccff",
  });

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  // Function to update the storage, using every time you make interaction with the canvas
  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    // Get current canvas object from the storage
    const canvasObjects = storage.get("canvasObjects");
    if (!canvasObjects || canvasObjects.size === 0) {
      return true;
    }
    // Map through all existing object and delete
    for (const [key, value] of Array.from(canvasObjects.entries())) {
      canvasObjects.delete(key);
    }
    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    // Deleting an object by deleting its id
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);
    switch (elem?.value) {
      case "reset":
        // Deleting in the storage as well as the existing canvas, and go back to the Select element
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;

      case "delete":
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;

      case "image":
        imageInputRef.current?.click();
        isDrawing.current = false;

        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;
      default:
        break;
    }
    selectedShapeRef.current = elem?.value as string;
  };

  // // Initialize the canvas
  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    });

    canvas.on("mouse:move", (options) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on("mouse:up", () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef,
      });
    });

    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas.on("selection:created", (options: any) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on("object:scaling", (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    canvas.on("path:created", (options) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });
    });

    window.addEventListener("keydown", (e) => {
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    });

    window.addEventListener("resize", () => {
      // handleResize({ fabricRef });
      handleResize({ canvas: fabricRef.current });
    });

    return () => {
      // Clean up, but also make sure the canvas is being clean and repainted after deleting any objects
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
  }, [canvasObjects]);

  return (
    <main className="h-screen overflow-hidden bg-accent/50">
      <NavBar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        imageInputRef={imageInputRef}
        handleImageUpload={(e: any) => {
          e.stopPropagation();
          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            shapeRef,
            syncShapeInStorage,
          });
        }}
      />

      {layout === Layout.SIDEBARS ? (
        <section className="flex h-full justify-center">
          <LeftSidebar isTabs={false} allShapes={Array.from(canvasObjects)} />
          <Live canvasRef={canvasRef} undo={undo} redo={redo} />
          <RightSidebar
            elementAttributes={elementAttributes}
            setElementAttributes={setElementAttributes}
            fabricRef={fabricRef}
            isEditingRef={isEditingRef}
            activeObjectRef={activeObjectRef}
            syncShapeInStorage={syncShapeInStorage}
            isTabs={false}
          />
        </section>
      ) : (
        <section className="relative flex h-full justify-center">
          <Tabs
            defaultValue="layers"
            className="w-[240px] top-10 left-2.5 z-10 absolute"
          >
            <TabsList className="bg-transparent">
              <TabsTrigger
                className="bg-transparent text-xs data-[state=active]:bg-transparent data-[state=active]:text-foreground font-semibold data-[state=active]:shadow-none"
                value="layers"
              >
                Layers
              </TabsTrigger>
              <TabsTrigger
                className="bg-transparent text-xs data-[state=active]:bg-transparent data-[state=active]:text-foreground font-semibold data-[state=active]:shadow-none"
                value="design"
              >
                Design
              </TabsTrigger>
            </TabsList>
            <TabsContent value="layers" className="rounded-md">
              <LeftSidebar
                allShapes={Array.from(canvasObjects)}
                isTabs={true}
              />
            </TabsContent>
            <TabsContent value="design">
              <RightSidebar
                elementAttributes={elementAttributes}
                setElementAttributes={setElementAttributes}
                fabricRef={fabricRef}
                isEditingRef={isEditingRef}
                activeObjectRef={activeObjectRef}
                syncShapeInStorage={syncShapeInStorage}
                isTabs={true}
              />
            </TabsContent>
          </Tabs>
          <Live canvasRef={canvasRef} undo={undo} redo={redo} />
        </section>
      )}
    </main>
  );
}
