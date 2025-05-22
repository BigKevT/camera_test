import { useState, useRef } from 'react';
import './App.css';

function CameraPage() {
  const [image, setImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageUrl = canvas.toDataURL('image/jpeg');
      setImage(imageUrl);
    }
  };

  return (
    <div className="camera-page">
      <h2>Camera Page</h2>
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', maxWidth: '640px' }}
        />
        {image && (
          <div className="captured-image">
            <img src={image} alt="Captured" style={{ width: '100%', maxWidth: '640px' }} />
          </div>
        )}
      </div>
      <div className="camera-controls">
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={takePhoto}>Take Photo</button>
        <button onClick={stopCamera}>Stop Camera</button>
      </div>
    </div>
  );
}

export default CameraPage; 