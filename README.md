# 2D Canvas Editor

A lightweight, web-based canvas editor built with React, Fabric.js, and Firebase Firestore. Create, edit, and save beautiful designs with an intuitive interface.

## 🚀 Live Demo

https://2dcanvaseditor.netlify.app/

## ✨ Features

### Core Functionality
- **Shape Tools**: Add rectangles, circles, and text elements
- **Freehand Drawing**: Pen tool for custom drawings
- **Object Manipulation**: Move, resize, rotate, and delete objects
- **Color Customization**: Rich color picker with preset palettes
- **Real-time Editing**: Edit text and colors of selected objects

### Advanced Features
- **Undo/Redo System**: Full history management (Ctrl+Z / Ctrl+Shift+Z)
- **Layers Panel**: Visual layer management with drag-and-drop reordering
- **Properties Panel**: Precise control over position, size, rotation, and appearance
- **Auto-Save**: Automatic saves every 10 minutes
- **Canvas Navigation**: Pan (Space + Drag) and Zoom (Ctrl + Scroll)
- **Keyboard Shortcuts**: Delete/Backspace to remove objects

### User Experience
- **Beautiful Landing Page**: Welcoming hero section with feature showcase
- **Canvas Management**: View, open, and delete saved canvases
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Polished UI with thoughtful transitions
- **Editable Canvas Names**: Rename your projects inline

## 🛠️ Tech Stack

- **Frontend**: React 19.2
- **Canvas Library**: Fabric.js 6.7.1
- **Backend**: Firebase Firestore
- **Routing**: React Router DOM 7.9.4
- **Styling**: Custom CSS with modern gradients and animations

## 📦 Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd canvas-editor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm start
```

5. Build for production:
```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── CanvasEditor.jsx      # Main canvas component with Fabric.js
│   ├── Toolbar.jsx            # Tool selection and color picker
│   ├── LayersPanel.jsx        # Layer management interface
│   └── PropertiesPanel.jsx    # Object properties editor
├── pages/
│   ├── Home.jsx               # Landing page
│   └── CanvasPage.jsx         # Canvas editor page
├── firebase/
│   └── config.js              # Firebase configuration
├── utils/
│   └── HistoryManager.js      # Undo/redo functionality
└── styles/
    └── global.css             # Application styles
```

## 🎯 Key Design Decisions

### Architecture
- **Component Modularity**: Each feature is isolated in its own component for maintainability
- **State Management**: React hooks (useState, useEffect, useRef) for efficient state handling
- **History Pattern**: Custom HistoryManager class implementing Command pattern for undo/redo
  - Maintains history stack with configurable max states (50)
  - Prevents state saving during undo/redo operations with `isLoading` flag
  - Efficient state management by slicing history after new changes

### User Experience
- **Visual Feedback**: Hover states, animations, and loading indicators throughout
- **Progressive Disclosure**: Side panels that can be toggled to maximize canvas space
- **Keyboard Support**: Common shortcuts for power users
- **Responsive Layout**: Adapts gracefully from desktop to mobile

### Performance
- **Efficient Renders**: useCallback and useRef to prevent unnecessary re-renders
- **Optimized Canvas**: Fabric.js configuration for smooth interactions
- **Debounced Auto-save**: Prevents excessive Firebase writes

### Data Persistence
- **Simple Schema**: Each canvas document stores name, JSON data, and timestamps
- **URL-based IDs**: Canvas ID in URL for easy sharing and bookmarking
- **Graceful Loading**: Loading states and error handling for network issues

## 🎨 Special Features

1. **Gradient Backgrounds**: Modern gradient overlays on landing page
2. **Floating Animations**: Subtle background animations for visual interest
3. **Drag-to-Reorder Layers**: Intuitive layer management
4. **Color Picker**: Native color input + hex input + preset swatches
5. **Canvas Thumbnails**: Preview on hover (prepared for future enhancement)
6. **Inline Name Editing**: Edit canvas names without dialogs

## 🔮 Future Enhancements

- Image upload and manipulation
- Export to PNG/SVG
- Templates library
- Collaboration features (real-time editing)
- Canvas thumbnail generation
- Grid and snap-to-grid
- Shape libraries and icons
- Text formatting options (bold, italic, fonts)

## 🐛 Known Limitations

- Canvas thumbnails show placeholders (awaiting implementation)
- Mobile experience optimized but limited by screen size
- No user authentication (by design for simplicity)

## 📝 License

This project was created as part of a technical assessment.

## 🙏 Acknowledgments

- Fabric.js for the powerful canvas library
- Firebase for seamless backend infrastructure
- React team for the excellent framework

---

**Built with ❤️ by Utkarsh Lotiya**