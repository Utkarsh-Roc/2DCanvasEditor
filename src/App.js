import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CanvasPage from './pages/CanvasPage.jsx';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/canvas/:canvasId" element={<CanvasPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;