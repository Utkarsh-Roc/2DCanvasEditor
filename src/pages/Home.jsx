import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

const HomePage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [recentCanvases, setRecentCanvases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [canvasName, setCanvasName] = useState("");
  const [showOldCanvases, setShowOldCanvases] = useState(false);
  const [hoveredCanvas, setHoveredCanvas] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentCanvases();
  }, []);

  const loadRecentCanvases = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "canvases"), orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const canvases = [];
      querySnapshot.forEach((doc) => {
        canvases.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setRecentCanvases(canvases);
    } catch (error) {
      console.error("Failed to load canvases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCanvas = async (canvasId, canvasName, e) => {
    e.stopPropagation(); // Prevent opening canvas when clicking delete

    if (
      !window.confirm(
        `Are you sure you want to delete "${canvasName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "canvases", canvasId));

      // Update local state to remove deleted canvas
      setRecentCanvases((prev) =>
        prev.filter((canvas) => canvas.id !== canvasId)
      );

      console.log("Canvas deleted successfully");
    } catch (error) {
      console.error("Failed to delete canvas:", error);
      alert("Failed to delete canvas. Please try again.");
    }
  };

  const handleCreateClick = () => {
    setShowNameModal(true);
    setCanvasName("");
  };

  const handleCreateCanvas = async () => {
    if (!canvasName.trim()) {
      alert("Please enter a canvas name");
      return;
    }

    setIsCreating(true);
    try {
      const docRef = await addDoc(collection(db, "canvases"), {
        name: canvasName.trim(),
        data: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setShowNameModal(false);
      navigate(`/canvas/${docRef.id}`);
    } catch (error) {
      alert("Failed to create canvas. Please try again.");
      console.error(error);
      setIsCreating(false);
    }
  };

  const handleOpenCanvas = (canvasId) => {
    navigate(`/canvas/${canvasId}`);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="home-wrapper">
      <div className="home-hero">
        {/* Hero Section */}
        <div className="hero-content">
          <div className="welcome-badge">
            <span className="badge-icon">👋</span>
            <span>Welcome to</span>
          </div>

          <h1 className="main-title">2D Canvas Editor</h1>

          <p className="main-subtitle">
            Design, illustrate, and bring your creative vision to life with our
            powerful yet intuitive canvas editor
          </p>

          {/* Action Cards */}
          <div className="action-cards">
            <div
              className="action-card create-card"
              onClick={handleCreateClick}
            >
              <div className="card-icon-wrapper">
                <span className="card-icon">✨</span>
              </div>
              <h3 className="card-title">Create New Canvas</h3>
              <p className="card-description">
                Start with a blank canvas and unleash your creativity
              </p>
              <div className="card-arrow">→</div>
            </div>

            <div
              className="action-card edit-card"
              onClick={() => setShowOldCanvases(true)}
            >
              <div className="card-icon-wrapper">
                <span className="card-icon">📂</span>
              </div>
              <h3 className="card-title">Open Existing Canvas</h3>
              <p className="card-description">
                Continue working on your saved projects
              </p>
              <div className="card-arrow">→</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="features-showcase">
            <div className="feature-showcase-item">
              <span className="showcase-icon">🔷</span>
              <span>Shapes & Objects</span>
            </div>
            <div className="feature-showcase-item">
              <span className="showcase-icon">✏️</span>
              <span>Freehand Drawing</span>
            </div>
            <div className="feature-showcase-item">
              <span className="showcase-icon">📝</span>
              <span>Text Editing</span>
            </div>
            <div className="feature-showcase-item">
              <span className="showcase-icon">🎨</span>
              <span>Color Palettes</span>
            </div>
            <div className="feature-showcase-item">
              <span className="showcase-icon">📊</span>
              <span>Layer Management</span>
            </div>
            <div className="feature-showcase-item">
              <span className="showcase-icon">💾</span>
              <span>Auto-Save</span>
            </div>
          </div>
        </div>
      </div>

      {/* Old Canvases Side Panel */}
      {showOldCanvases && (
        <>
          <div
            className="old-canvas-overlay"
            onClick={() => setShowOldCanvases(false)}
          />
          <div className="old-canvas-panel">
            <div className="old-canvas-header">
              <h2>Your Canvases</h2>
              <button
                className="close-panel-btn"
                onClick={() => setShowOldCanvases(false)}
              >
                ✕
              </button>
            </div>

            <div className="old-canvas-list">
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner large"></div>
                  <p>Loading your canvases...</p>
                </div>
              ) : recentCanvases.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No canvases yet</p>
                  <small>Create your first canvas to get started</small>
                </div>
              ) : (
                recentCanvases.map((canvas) => (
                  <div
                    key={canvas.id}
                    className="old-canvas-item"
                    onClick={() => handleOpenCanvas(canvas.id)}
                    onMouseEnter={() => setHoveredCanvas(canvas.id)}
                    onMouseLeave={() => setHoveredCanvas(null)}
                  >
                    <div className="canvas-item-icon">
                      <span>🎨</span>
                    </div>
                    <div className="canvas-item-info">
                      <div className="canvas-item-name">
                        {canvas.name || "Untitled"}
                      </div>
                      <div className="canvas-item-date">
                        {formatDate(canvas.updatedAt)}
                      </div>
                    </div>
                    <button
                      className="canvas-item-delete"
                      onClick={(e) =>
                        handleDeleteCanvas(canvas.id, canvas.name, e)
                      }
                      title="Delete canvas"
                    >
                      🗑️
                    </button>
                    <div className="canvas-item-arrow">→</div>
                    {/* Thumbnail Preview on Hover */}
                    {hoveredCanvas === canvas.id && (
                      <div className="canvas-thumbnail-preview">
                        <div className="thumbnail-content">
                          {canvas.data ? (
                            <div className="thumbnail-placeholder">
                              <span>🖼️</span>
                              <small>Canvas Preview</small>
                            </div>
                          ) : (
                            <div className="thumbnail-empty">
                              <span>📄</span>
                              <small>Empty Canvas</small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Name Modal */}
      {showNameModal && (
        <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✨</div>
            <h2>Name Your Canvas</h2>
            <p className="modal-subtitle">Give your project a memorable name</p>
            <input
              type="text"
              value={canvasName}
              onChange={(e) => setCanvasName(e.target.value)}
              placeholder="e.g., Product Design, Logo Concept..."
              className="modal-input"
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleCreateCanvas()}
            />
            <div className="modal-actions">
              <button
                onClick={() => setShowNameModal(false)}
                className="modal-btn cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCanvas}
                disabled={isCreating}
                className="modal-btn create-btn-modal"
              >
                {isCreating ? (
                  <>
                    <span className="spinner small"></span>
                    Creating...
                  </>
                ) : (
                  "Create Canvas"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
