import { useState } from 'react'
import './App.css'
import CameraViewer from './CameraViewer'
import CameraPage from './CameraPage'
import ReactCameraPage from './ReactCameraPage'
import AutoFocusCamera from './AutoFocusCamera'

function App() {
  const [currentPage, setCurrentPage] = useState('viewer'); // 'viewer', 'camera', or 'react-camera'

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <button 
          className={currentPage === 'viewer' ? 'active' : ''} 
          onClick={() => setCurrentPage('viewer')}
        >
          📷 相機資訊
        </button>
        <button 
          className={currentPage === 'camera' ? 'active' : ''} 
          onClick={() => setCurrentPage('camera')}
        >
          📸 拍照模式
        </button>
        <button 
          className={currentPage === 'react-camera' ? 'active' : ''} 
          onClick={() => setCurrentPage('react-camera')}
        >
          📱 React相機
        </button>
        <button 
          className={currentPage === 'auto-camera' ? 'active' : ''} 
          onClick={() => setCurrentPage('auto-camera')}
        >
          Auto Camera
        </button>
      </nav>
      <main className="main-content">
        {currentPage === 'viewer' && <CameraViewer />}
        {currentPage === 'camera' && <CameraPage />}
        {currentPage === 'react-camera' && <ReactCameraPage />}
        {currentPage === 'auto-camera' && <AutoFocusCamera />}
      </main>
    </div>
  )
}

export default App
