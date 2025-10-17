class HistoryManager {
  constructor(maxStates = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxStates = maxStates;
    this.isLoading = false;
  }

  saveState(canvas) {
    // Don't save state if we are in the middle of an undo/redo
    if (this.isLoading) return;

    // Remove any states after current index (when user makes change after undo)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Serialize canvas state
    const state = canvas.toJSON();
    this.history.push(state);

    // Limit history size
    if (this.history.length > this.maxStates) {
      this.history.shift();
    }
    this.currentIndex = this.history.length - 1;
  }

  // Check if undo is possible
  canUndo() {
    return this.currentIndex > 0;
  }

  // Check if redo is possible
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  // Undo to previous state
  async undo(canvas) {
    if (!this.canUndo()) return false;
    
    this.isLoading = true;
    try {
      this.currentIndex--;
      const state = this.history[this.currentIndex];
      
      await canvas.loadFromJSON(state);
      canvas.renderAll();
    } catch (error) {
      console.error("Failed to undo:", error);
    } finally {
      this.isLoading = false; // Ensure flag is reset
    }
    return true;
  }

  async redo(canvas) {
    if (!this.canRedo()) return false;

    this.isLoading = true;
    try {
      this.currentIndex++;
      const state = this.history[this.currentIndex];
      
      await canvas.loadFromJSON(state);
      canvas.renderAll();
    } catch (error) {
      console.error("Failed to redo:", error);
    } finally {
      this.isLoading = false;
    }
    return true;
  }

  // Clear history
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

export default HistoryManager;