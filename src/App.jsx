import { useState } from 'react'
import './App.css'
import CameraViewer from './CameraViewer'
import CameraPage from './CameraPage'

function App() {
  const [currentPage, setCurrentPage] = useState('viewer'); // 'viewer' or 'camera'

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <button 
          className={currentPage === 'viewer' ? 'active' : ''} 
          onClick={() => setCurrentPage('viewer')}
        >
          Viewer
        </button>
        <button 
          className={currentPage === 'camera' ? 'active' : ''} 
          onClick={() => setCurrentPage('camera')}
        >
          Camera
        </button>
      </nav>
      <main className="main-content">
        {currentPage === 'viewer' ? <CameraViewer /> : <CameraPage />}
      </main>
    </div>
  )
}

export default App
