    import React, { useState, useEffect, useRef } from "react";

    const Toolbar = ({
    tool,
    setTool,
    color,
    setColor,
    onSave,
    onClear,
    isSaving,
    canvasId,
    onAddRect,
    onAddCircle,
    onAddText,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (
            colorPickerRef.current &&
            !colorPickerRef.current.contains(event.target)
        ) {
            setShowColorPicker(false);
        }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toolModes = [
        { id: "select", icon: "👆", label: "Select" },
        { id: "pen", icon: "✏️", label: "Pen" },
    ];

    const shapeActions = [
        { id: "rect", icon: "▢", label: "Rectangle", action: onAddRect },
        { id: "circle", icon: "◯", label: "Circle", action: onAddCircle },
        { id: "text", icon: "T", label: "Text", action: onAddText },
    ];

    const presetColors = [
        "#000000",
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E2",
        "#52B788",
        "#FF9FF3",
        "#FECA57",
    ];

    return (
        <div className="toolbar-container">
        <div className="toolbar">
            <div className="toolbar-section">
            <div className="canvas-info">
                <span className="canvas-id-label">Canvas ID:</span>
                <code className="canvas-id">{canvasId?.substring(0, 12)}...</code>
            </div>
            </div>

            <div className="toolbar-section tools-section">
            {toolModes.map((t) => (
                <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`tool-btn ${tool === t.id ? "active" : ""}`}
                title={t.label}
                >
                <span className="tool-icon">{t.icon}</span>
                <span className="tool-label">{t.label}</span>
                </button>
            ))}

            {/* Undo/Redo Buttons */}
            <div className="toolbar-divider"></div>
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="tool-btn undo-btn"
                title="Undo (Ctrl+Z)"
            >
                <span className="tool-icon">↶</span>
                <span className="tool-label">Undo</span>
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className="tool-btn redo-btn"
                title="Redo (Ctrl+Shift+Z)"
            >
                <span className="tool-icon">↷</span>
                <span className="tool-label">Redo</span>
            </button>
            <div className="toolbar-divider"></div>

            {shapeActions.map((t) => (
                <button
                key={t.id}
                onClick={t.action}
                className="tool-btn"
                title={t.label}
                >
                <span className="tool-icon">{t.icon}</span>
                <span className="tool-label">{t.label}</span>
                </button>
            ))}

            <div className="color-picker-wrapper" ref={colorPickerRef}>
                <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="color-btn"
                title="Choose Color"
                >
                <span
                    className="color-preview"
                    style={{ backgroundColor: color }}
                ></span>
                <span className="color-label">Color</span>
                </button>

                {showColorPicker && (
                <div className="color-picker-dropdown">
                    <div className="color-input-section">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="native-color-picker"
                    />
                    <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="color-hex-input"
                        placeholder="#000000"
                    />
                    </div>
                    <div className="preset-colors">
                    {presetColors.map((c) => (
                        <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`preset-color ${
                            color === c ? "selected" : ""
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                        />
                    ))}
                    </div>
                </div>
                )}
            </div>
            </div>

            <div className="toolbar-section actions-section">
            <button
                onClick={onClear}
                className="action-btn clear-btn"
                title="Clear Canvas"
            >
                🗑️ Clear
            </button>
            <button
                onClick={onSave}
                disabled={isSaving}
                className="action-btn save-btn"
                title="Save Canvas"
            >
                {isSaving ? (
                <>
                    <span className="spinner small"></span>
                    Saving...
                </>
                ) : (
                <>💾 Save</>
                )}
            </button>
            </div>
        </div>
        </div>
    );
    };

    export default Toolbar;
