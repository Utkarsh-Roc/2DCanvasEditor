import React, { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import HistoryManager from "../utils/HistoryManager";

const CANVAS_CONFIG = {
  MAX_WIDTH: 1200,
  MIN_MARGIN: 100,
  HEIGHT_OFFSET: 200,
  MAX_ZOOM: 5,
  MIN_ZOOM: 0.1,
  ZOOM_STEP: 0.1,
};

const CanvasEditor = ({
  canvasId,
  color,
  tool,
  onCanvasReady,
  onHistoryChange,
}) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const historyRef = useRef(new HistoryManager());
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);
  const colorRef = useRef(color);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    if (isInitializedRef.current || !canvasRef.current) return;
    isInitializedRef.current = true;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width:
        window.innerWidth > CANVAS_CONFIG.MAX_WIDTH
          ? CANVAS_CONFIG.MAX_WIDTH
          : window.innerWidth - CANVAS_CONFIG.MIN_MARGIN,
      height: window.innerHeight - CANVAS_CONFIG.HEIGHT_OFFSET,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    fabricCanvasRef.current = canvas;

    onCanvasReady(canvas, historyRef.current);
    loadCanvasData(canvas);

    const saveHistoryState = () => {
      historyRef.current.saveState(canvas);
      if (onHistoryChange) {
        onHistoryChange({
          canUndo: historyRef.current.canUndo(),
          canRedo: historyRef.current.canRedo(),
        });
      }
    };

    canvas.on("object:added", saveHistoryState);
    canvas.on("object:removed", saveHistoryState);
    canvas.on("object:modified", saveHistoryState);
    canvas.on("text:changed", saveHistoryState);

    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !["INPUT", "TEXTAREA"].includes(e.target.tagName)
      ) {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
          activeObjects.forEach((obj) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        e.preventDefault();
      }

      if (
        e.code === "Space" &&
        !["INPUT", "TEXTAREA"].includes(e.target.tagName)
      ) {
        isPanning = true;
        canvas.defaultCursor = "grab";
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        isPanning = false;
        canvas.defaultCursor = "default";
      }
    };

    const handleMouseDown = (e) => {
      if (isPanning) {
        panStartX = e.clientX;
        panStartY = e.clientY;
      }
    };

    const handleMouseMove = (e) => {
      if (isPanning && (e.clientX !== panStartX || e.clientY !== panStartY)) {
        const deltaX = e.clientX - panStartX;
        const deltaY = e.clientY - panStartY;

        canvas.viewportTransform[4] += deltaX;
        canvas.viewportTransform[5] += deltaY;
        canvas.renderAll();

        panStartX = e.clientX;
        panStartY = e.clientY;
        canvas.defaultCursor = "grabbing";
      }
    };

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const zoom = canvas.getZoom();
        let newZoom =
          zoom +
          (e.deltaY > 0 ? -CANVAS_CONFIG.ZOOM_STEP : CANVAS_CONFIG.ZOOM_STEP);
        newZoom = Math.max(
          CANVAS_CONFIG.MIN_ZOOM,
          Math.min(CANVAS_CONFIG.MAX_ZOOM, newZoom)
        );

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        canvas.zoomToPoint({ x, y }, newZoom);
        canvas.renderAll();
      }
    };

    canvasRef.current.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    canvasRef.current.addEventListener("mousedown", handleMouseDown);
    canvasRef.current.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const handleUndo = async () => {
      await historyRef.current.undo(canvas);
      if (onHistoryChange) {
        onHistoryChange({
          canUndo: historyRef.current.canUndo(),
          canRedo: historyRef.current.canRedo(),
        });
      }
    };

    const handleRedo = async () => {
      await historyRef.current.redo(canvas);
      if (onHistoryChange) {
        onHistoryChange({
          canUndo: historyRef.current.canUndo(),
          canRedo: historyRef.current.canRedo(),
        });
      }
    };

    const handleResize = () => {
      const newWidth =
        window.innerWidth > CANVAS_CONFIG.MAX_WIDTH
          ? CANVAS_CONFIG.MAX_WIDTH
          : window.innerWidth - CANVAS_CONFIG.MIN_MARGIN;
      const newHeight = window.innerHeight - CANVAS_CONFIG.HEIGHT_OFFSET;
      canvas.setDimensions({ width: newWidth, height: newHeight });
      canvas.calcOffset();
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      canvas.calcOffset();
    }, 100);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      canvas.off("object:added", saveHistoryState);
      canvas.off("object:removed", saveHistoryState);
      canvas.off("object:modified", saveHistoryState);
      canvas.off("text:changed", saveHistoryState);
      if (canvas) {
        canvas.dispose();
      }
      isInitializedRef.current = false;
    };
  }, [onCanvasReady, onHistoryChange]);

  const loadCanvasData = async (canvas) => {
    setIsLoading(true);
    try {
      const docRef = doc(db, "canvases", canvasId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.data) {
          let canvasJson;
          if (typeof data.data === "string") {
            canvasJson = JSON.parse(data.data);
          } else {
            canvasJson = data.data;
          }

          await canvas.loadFromJSON(canvasJson);
          canvas.calcOffset();
          canvas.renderAll();

          historyRef.current.saveState(canvas);
          if (onHistoryChange) {
            onHistoryChange({
              canUndo: historyRef.current.canUndo(),
              canRedo: historyRef.current.canRedo(),
            });
          }
        }
        setIsLoading(false);
      } else {
        console.log("No such document!");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to load canvas:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = "default";

    if (tool === "pen") {
      canvas.isDrawingMode = true;
      canvas.selection = false;
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.color = colorRef.current;
      canvas.freeDrawingBrush.width = 3;
      canvas.defaultCursor = "crosshair";
    }
  }, [tool]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }

    if (tool === "select") {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        if (
          activeObject.type === "textbox" ||
          activeObject.type === "i-text" ||
          activeObject.type === "text"
        ) {
          activeObject.set("fill", color);
          if (activeObject._textLines) {
            activeObject.setSelectionStyles(
              { fill: color },
              0,
              activeObject.text.length
            );
          }
        } else if (activeObject.type !== "path") {
          activeObject.set("fill", color);
        } else {
          activeObject.set("stroke", color);
        }
        canvas.renderAll();
      }
    }
  }, [color, tool]);

  return (
    <div className="canvas-container">
      {isLoading && (
        <div className="canvas-loading">
          <div className="spinner large"></div>
          <p>Loading canvas...</p>
        </div>
      )}
      <canvas ref={canvasRef} className="fabric-canvas" />
      <div className="canvas-hints">
        <span className="hint">💡 Ctrl+Z to Undo | Ctrl+Shift+Z to Redo</span>
        <span className="hint">💡 Press Delete to remove selected objects</span>
        <span className="hint">💡 Click and drag to move objects</span>
      </div>
    </div>
  );
};

export default CanvasEditor;
