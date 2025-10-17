import React, { useState, useEffect } from 'react';

const LayersPanel = ({ canvas, onLayerSelect, onClose }) => {
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [draggedLayerId, setDraggedLayerId] = useState(null);
  
  const updateLayers = () => {
    if (!canvas) return;

    const objects = canvas.getObjects(); 
    const layerList = objects.map((obj, index) => ({
      id: obj.id || `layer-${index}`,
      index: index,
      name: obj.name || getObjectName(obj, index),
      type: obj.type,
      visible: obj.opacity !== 0,
      opacity: obj.opacity === undefined ? 1 : obj.opacity,
      object: obj,
    }));
    
    layerList.forEach(layer => {
      if (!layer.object.id) {
        layer.object.id = layer.id;
      }
    });

    setLayers(layerList);
  };

  const getObjectName = (obj, index) => {
    if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
      return `Text ${index + 1}`;
    } else if (obj.type === 'rect') {
      return `Rectangle ${index + 1}`;
    } else if (obj.type === 'circle') {
      return `Circle ${index + 1}`;
    } else if (obj.type === 'path') {
      return `Drawing ${index + 1}`;
    }
    return `Object ${index + 1}`;
  };

  useEffect(() => {
    if (!canvas) return;

    updateLayers();

    const handleCanvasUpdate = () => updateLayers(); 

    const handleSelectionCreated = (e) => {
      if (e.selected && e.selected[0]) {
        setSelectedLayerId(e.selected[0].id);
      }
    };
    
    const handleSelectionUpdated = (e) => {
      if (e.selected && e.selected[0]) {
        setSelectedLayerId(e.selected[0].id);
      }
    };
    
    const handleSelectionCleared = () => {
      setSelectedLayerId(null);
    };
    canvas.on('object:added', handleCanvasUpdate);
    canvas.on('object:removed', handleCanvasUpdate);
    canvas.on('object:modified', handleCanvasUpdate);
    canvas.on('after:render', handleCanvasUpdate);
    
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('object:added', handleCanvasUpdate);
      canvas.off('object:removed', handleCanvasUpdate);
      canvas.off('object:modified', handleCanvasUpdate);
      canvas.off('after:render', handleCanvasUpdate);
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvas]);

  const handleLayerClick = (layer) => {
    if (!canvas) return;
    canvas.setActiveObject(layer.object);
    canvas.renderAll();
    setSelectedLayerId(layer.id);
    onLayerSelect?.(layer);
  };

  const handleLayerVisibilityToggle = (e, layer) => {
    e.stopPropagation();
    const currentOpacity = layer.object.opacity;
    const newOpacity = (currentOpacity === 0) ? 1 : 0;
    
    layer.object.set('opacity', newOpacity);
    canvas.renderAll();
  };

  const handleLayerDelete = (e, layer) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.remove(layer.object);
  };

  const handleMoveLayerUp = (e, layer) => {
    e.stopPropagation();
    if (!canvas || !canvas._objects) return;

    const allObjects = canvas._objects;
    const currentIndex = allObjects.indexOf(layer.object);
    
    if (currentIndex < allObjects.length - 1) {
      const obj = allObjects[currentIndex];
      allObjects[currentIndex] = allObjects[currentIndex + 1];
      allObjects[currentIndex + 1] = obj;
      
      canvas.requestRenderAll();
    }
  };

  const handleMoveLayerDown = (e, layer) => {
    e.stopPropagation();
    if (!canvas || !canvas._objects) return;
    const allObjects = canvas._objects;
    const currentIndex = allObjects.indexOf(layer.object);
    
    if (currentIndex > 0) {
      const obj = allObjects[currentIndex];
      allObjects[currentIndex] = allObjects[currentIndex - 1];
      allObjects[currentIndex - 1] = obj;
      
      canvas.requestRenderAll();
    }
  };

  const handleDragStart = (e, layer) => {
    setDraggedLayerId(layer.id);
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.layer-item.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    setDraggedLayerId(null);
  };

  const handleDragOver = (e, targetLayer) => {
    e.preventDefault(); 
    if (draggedLayerId === targetLayer.id) return;
    
    document.querySelectorAll('.layer-item.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetLayer) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (!draggedLayerId || draggedLayerId === targetLayer.id) {
      setDraggedLayerId(null);
      return;
    }

    const draggedLayer = layers.find(l => l.id === draggedLayerId);
    
    if (draggedLayer && canvas && canvas._objects) {
      const allObjects = canvas._objects;
      
      const objectToMove = draggedLayer.object;
      const currentIndex = allObjects.indexOf(objectToMove);
      const targetIndex = targetLayer.index;

      if (currentIndex === -1) {
        setDraggedLayerId(null);
        return;
      }
      allObjects.splice(currentIndex, 1);
      allObjects.splice(targetIndex, 0, objectToMove);
      canvas.requestRenderAll();
    }

    setDraggedLayerId(null);
  };

  return (
    <div className="layers-panel">
      <div className="layers-header">
        <button onClick={onClose} className="panel-close-btn" title="Hide Panel">
          ‹
        </button>
        <h3>Layers</h3>
        <span className="layer-count">{layers.length}</span>
      </div>

      {layers.length === 0 ? (
        <div className="layers-empty">
          <p>No objects yet</p>
        </div>
      ) : (
        <div className="layers-list">
          {layers.slice().reverse().map((layer, idx) => {
            return (
              <div
                key={layer.id}
                className={`layer-item ${selectedLayerId === layer.id ? 'active' : ''}`}
                onClick={() => handleLayerClick(layer)}
                
                draggable="true"
                onDragStart={(e) => handleDragStart(e, layer)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, layer)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, layer)}
              >
                <span className="layer-item-drag-handle" title="Drag to reorder">
                  ⠿
                </span>
                <div className="layer-visibility">
                  <button
                    className="visibility-btn"
                    onClick={(e) => handleLayerVisibilityToggle(e, layer)}
                    title={layer.visible ? 'Hide' : 'Show'}
                  >
                    {layer.visible ? '👁' : '👁‍🗨'}
                  </button>
                </div>

                <div className="layer-info">
                  <span className="layer-name">{layer.name}</span>
                  <span className="layer-type">{layer.type}</span>
                </div>

                <div className="layer-controls">
                  <button
                    className="layer-btn"
                    onClick={(e) => handleMoveLayerUp(e, layer)}
                    disabled={layer.index === layers.length - 1} 
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    className="layer-btn"
                    onClick={(e) => handleMoveLayerDown(e, layer)}
                    disabled={layer.index === 0} 
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    className="layer-btn delete-btn"
                    onClick={(e) => handleLayerDelete(e, layer)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LayersPanel;