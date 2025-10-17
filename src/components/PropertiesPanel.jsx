import React, { useState, useEffect } from "react";

const PropertiesPanel = ({ canvas, selectedObject, onClose }) => {
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    if (!selectedObject) {
      setProperties(null);
      return;
    }
    updateProperties();
  }, [selectedObject]);

  const updateProperties = () => {
    if (!selectedObject) return;

    setProperties({
      name: selectedObject.name || "",
      left: Math.round(selectedObject.left || 0),
      top: Math.round(selectedObject.top || 0),
      width: Math.round(selectedObject.width || 0),
      height: Math.round(selectedObject.height || 0),
      scaleX: selectedObject.scaleX || 1,
      scaleY: selectedObject.scaleY || 1,
      angle: Math.round(selectedObject.angle || 0),
      opacity:
        selectedObject.opacity !== undefined ? selectedObject.opacity : 1,
      fill: selectedObject.fill || "#000000",
      stroke: selectedObject.stroke || "transparent",
      strokeWidth: selectedObject.strokeWidth || 0,
    });
  };

  const handlePropertyChange = (property, value) => {
    if (!selectedObject || !canvas) return;

    let numValue = value;
    if (
      ["left", "top", "width", "height", "angle", "strokeWidth"].includes(
        property
      )
    ) {
      numValue = parseInt(value) || 0;
    } else if (["scaleX", "scaleY", "opacity"].includes(property)) {
      numValue = parseFloat(value) || 0;
    }

    selectedObject.set(property, numValue);
    canvas.renderAll();

    setProperties((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <button
          onClick={onClose}
          className="panel-close-btn"
          title="Hide Panel"
        >
          ›
        </button>
        <h3>Properties</h3>
      </div>

      {properties ? (
        <div className="properties-list">
          {/* Position & Size Section */}
          <div className="property-section">
            <div className="section-title">Position & Size</div>
            <div className="property-group">
              <label>X</label>
              <input
                type="number"
                value={properties.left}
                onChange={(e) => handlePropertyChange("left", e.target.value)}
                className="property-input"
              />
            </div>
            <div className="property-group">
              <label>Y</label>
              <input
                type="number"
                value={properties.top}
                onChange={(e) => handlePropertyChange("top", e.target.value)}
                className="property-input"
              />
            </div>
            <div className="property-group">
              <label>Width</label>
              <input
                type="number"
                value={properties.width}
                onChange={(e) => handlePropertyChange("width", e.target.value)}
                className="property-input"
              />
            </div>
            <div className="property-group">
              <label>Height</label>
              <input
                type="number"
                value={properties.height}
                onChange={(e) => handlePropertyChange("height", e.target.value)}
                className="property-input"
              />
            </div>
          </div>

          {/* Transform Section */}
          <div className="property-section">
            <div className="section-title">Transform</div>
            <div className="property-group">
              <label>Rotation (°)</label>
              <input
                type="number"
                value={properties.angle}
                min="0"
                max="360"
                onChange={(e) => handlePropertyChange("angle", e.target.value)}
                className="property-input"
              />
            </div>
            <div className="property-group">
              <label>Scale X</label>
              <input
                type="number"
                value={typeof properties.scaleX === 'number' ? properties.scaleX.toFixed(2) : properties.scaleX}
                step="0.1"
                min="0.1"
                onChange={(e) => handlePropertyChange("scaleX", e.target.value)}
                className="property-input"
              />
            </div>
            <div className="property-group">
              <label>Scale Y</label>
              <input
                type="number"
                value={typeof properties.scaleY === 'number' ? properties.scaleY.toFixed(2) : properties.scaleY}
                step="0.1"
                min="0.1"
                onChange={(e) => handlePropertyChange("scaleY", e.target.value)}
                className="property-input"
              />
            </div>
          </div>

          {/* Appearance Section */}
          <div className="property-section">
            <div className="section-title">Appearance</div>
            <div className="property-group">
              <label>Opacity</label>
              <input
                type="range"
                value={properties.opacity}
                min="0"
                max="1"
                step="0.1"
                onChange={(e) =>
                  handlePropertyChange("opacity", e.target.value)
                }
                className="property-slider"
              />
              <span className="slider-value">
                {Math.round(properties.opacity * 100)}%
              </span>
            </div>
            <div className="property-group">
              <label>Fill Color</label>
              <input
                type="color"
                value={properties.fill || "#000000"}
                onChange={(e) => handlePropertyChange("fill", e.target.value)}
                className="property-color"
              />
            </div>
            {properties.strokeWidth > 0 && (
              <>
                <div className="property-group">
                  <label>Stroke Color</label>
                  <input
                    type="color"
                    value={properties.stroke || "#000000"}
                    onChange={(e) =>
                      handlePropertyChange("stroke", e.target.value)
                    }
                    className="property-color"
                  />
                </div>
                <div className="property-group">
                  <label>Stroke Width</label>
                  <input
                    type="number"
                    value={properties.strokeWidth}
                    min="0"
                    onChange={(e) =>
                      handlePropertyChange("strokeWidth", e.target.value)
                    }
                    className="property-input"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="properties-empty">
          <p>Select an object to view properties</p>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;