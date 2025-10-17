import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import CanvasEditor from "../components/CanvasEditor";
import LayersPanel from "../components/LayersPanel";
import PropertiesPanel from "../components/PropertiesPanel";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import * as fabric from "fabric";

// Auto-save interval (1 min / 60sec)
const AUTO_SAVE_INTERVAL = 600000;

const CanvasPage = () => {
  const { canvasId } = useParams();
  const navigate = useNavigate();

  const [tool, setTool] = useState("select");
  const [color, setColor] = useState("#4ECDC4");

  const [isSaving, setIsSaving] = useState(false);
  const [canvasName, setCanvasName] = useState("Untitled");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);

  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);

  const canvasRef = useRef(null);
  const historyManagerRef = useRef(null);
  const nameInputRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const colorRef = useRef(color);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    const loadCanvasName = async () => {
      try {
        const docRef = doc(db, "canvases", canvasId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().name) {
          setCanvasName(docSnap.data().name);
        }
      } catch (error) {
        console.error("Failed to load canvas name:", error);
      }
    };

    loadCanvasName();
  }, [canvasId]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const onCanvasReady = useCallback((canvas, historyManager) => {
    canvasRef.current = canvas;
    historyManagerRef.current = historyManager;

    canvas.on("selection:created", (e) => {
      setSelectedObject(e.selected[0] || null);
    });

    canvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected[0] || null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });
  }, []);

  const handleHistoryChange = useCallback((historyState) => {
    setCanUndo(historyState.canUndo);
    setCanRedo(historyState.canRedo);
  }, []);

  const handleUndo = useCallback(async () => {
    if (historyManagerRef.current && canvasRef.current) {
      await historyManagerRef.current.undo(canvasRef.current);
      handleHistoryChange({
        canUndo: historyManagerRef.current.canUndo(),
        canRedo: historyManagerRef.current.canRedo(),
      });
    }
  }, [handleHistoryChange]);

  const handleRedo = useCallback(async () => {
    if (historyManagerRef.current && canvasRef.current) {
      await historyManagerRef.current.redo(canvasRef.current);
      handleHistoryChange({
        canUndo: historyManagerRef.current.canUndo(),
        canRedo: historyManagerRef.current.canRedo(),
      });
    }
  }, [handleHistoryChange]);

  const handleStartEditName = () => {
    setTempName(canvasName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      alert("Canvas name cannot be empty");
      return;
    }

    const newName = tempName.trim();
    setCanvasName(newName);
    setIsEditingName(false);

    try {
      const docRef = doc(db, "canvases", canvasId);
      await setDoc(
        docRef,
        {
          name: newName,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      console.log("Canvas name updated successfully");
    } catch (error) {
      console.error("Failed to update canvas name:", error);
      alert("Failed to update canvas name");
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setTempName("");
  };

  const handleNameKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEditName();
    }
  };

  const performSave = useCallback(async () => {
    if (!canvasRef.current) {
      console.error("Canvas not initialized");
      return;
    }

    setIsSaving(true);
    setAutoSaveStatus("Saving...");
    try {
      const json = canvasRef.current.toJSON();
      const canvasDataString = JSON.stringify(json);

      const docRef = doc(db, "canvases", canvasId);
      await setDoc(docRef, {
        name: canvasName,
        data: canvasDataString,
        updatedAt: new Date(),
        version: 1,
      });

      setLastSaved(new Date());
      setAutoSaveStatus("Saved");
      setTimeout(() => setAutoSaveStatus(""), 3000);

      console.log("Canvas saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      setAutoSaveStatus("Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [canvasName, canvasId]);

  const handleSave = async () => {
    await performSave();
    const btn = document.querySelector(".save-btn");
    if (btn) {
      btn.classList.add("success");
      setTimeout(() => btn.classList.remove("success"), 2000);
    }
  };

  useEffect(() => {
    autoSaveTimeoutRef.current = setInterval(() => {
      performSave();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearInterval(autoSaveTimeoutRef.current);
      }
    };
  }, [performSave]);

  const handleClear = () => {
    if (!canvasRef.current) return;

    if (
      window.confirm(
        "Are you sure you want to clear the canvas? This cannot be undone."
      )
    ) {
      canvasRef.current.clear();
      canvasRef.current.backgroundColor = "#ffffff";
      canvasRef.current.renderAll();
    }
  };

  const addShape = useCallback((shapeType) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let shape;
    const commonProps = {
      left: 100 + Math.random() * 100,
      top: 100 + Math.random() * 100,
      fill: colorRef.current,
      stroke: "#333",
      strokeWidth: 2,
    };

    switch (shapeType) {
      case "rect":
        shape = new fabric.Rect({
          ...commonProps,
          width: 120,
          height: 80,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          ...commonProps,
          radius: 60,
        });
        break;
      case "text":
        shape = new fabric.Textbox("Double click to edit", {
          ...commonProps,
          fontSize: 24,
          width: 200,
          fontFamily: "Arial",
          editable: true,
          lineHeight: 1.2,
          fill: colorRef.current,
          stroke: null,
          strokeWidth: 0,
        });
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    setTool("select");
  }, []);

  return (
    <div className="canvas-page">
      {/* Header with name and save status */}
      <div className="page-header">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back to Home
        </button>

        <div className="page-title-container">
          {isEditingName ? (
            <div className="name-edit-mode">
              <input
                ref={nameInputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleNameKeyPress}
                className="name-input"
              />
              <button
                onClick={handleSaveName}
                className="name-action-btn save-name-btn"
                title="Save"
              >
                ✓
              </button>
              <button
                onClick={handleCancelEditName}
                className="name-action-btn cancel-name-btn"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="page-title-with-edit">
              <h2 className="page-title">{canvasName}</h2>
              <button
                onClick={handleStartEditName}
                className="edit-name-btn"
                title="Edit canvas name"
              >
                ✎
              </button>
            </div>
          )}
        </div>

        <div className="save-status">
          {autoSaveStatus && (
            <span className="status-text">{autoSaveStatus}</span>
          )}
          {lastSaved && !autoSaveStatus && (
            <span className="status-text saved">
              Last saved:{" "}
              {lastSaved.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Toolbar with tools, colors, and actions */}
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        onSave={handleSave}
        onClear={handleClear}
        isSaving={isSaving}
        canvasId={canvasId}
        onAddRect={() => addShape("rect")}
        onAddCircle={() => addShape("circle")}
        onAddText={() => addShape("text")}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <button
        className={`panel-toggle-btn left ${isLayersOpen ? "open" : ""}`}
        onClick={() => setIsLayersOpen((o) => !o)}
        title={isLayersOpen ? "Hide Layers" : "Show Layers"}
      >
        <span>Layers</span>
      </button>

      <button
        className={`panel-toggle-btn right ${isPropertiesOpen ? "open" : ""}`}
        onClick={() => setIsPropertiesOpen((p) => !p)}
        title={isPropertiesOpen ? "Hide Properties" : "Show Properties"}
      >
        <span>Properties</span>
      </button>

      {/* Main Workspace: Layers | Canvas | Properties */}
      <div
        className={`workspace-layout ${isLayersOpen ? "layers-open" : ""} ${
          isPropertiesOpen ? "properties-open" : ""
        }`}
      >
        {/* Left Panel - Layers */}
        <div className={`side-panel left-panel ${isLayersOpen ? "open" : ""}`}>
          <LayersPanel
            canvas={canvasRef.current}
            onLayerSelect={(layer) => setSelectedObject(layer.object)}
            onClose={() => setIsLayersOpen(false)}
          />
        </div>

        {/* Center - Canvas */}
        <div className="canvas-wrapper">
          <CanvasEditor
            canvasId={canvasId}
            color={color}
            tool={tool}
            onCanvasReady={onCanvasReady}
            onHistoryChange={handleHistoryChange}
          />
        </div>

        {/* Right Panel - Properties */}
        <div
          className={`side-panel right-panel ${isPropertiesOpen ? "open" : ""}`}
        >
          <PropertiesPanel
            canvas={canvasRef.current}
            selectedObject={selectedObject}
            onClose={() => setIsPropertiesOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasPage;
