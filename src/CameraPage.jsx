import { useState, useRef, useEffect } from 'react';
import './App.css';

function CameraPage() {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 組件卸載時清理相機
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      // 先檢查是否支持 getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }

      // 先停止現有的相機流
      if (streamRef.current) {
        stopCamera();
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          advanced: [
            {
              focusMode: 'continuous',
              exposureMode: 'continuous',
              whiteBalanceMode: 'continuous'
            }
          ]
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // 確保視頻元素開始播放
        await videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          throw new Error('Failed to start video playback');
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(err.message || 'Failed to access camera');
      
      // 如果後置相機失敗，嘗試使用前置相機
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (fallbackErr) {
        console.error('Error accessing front camera:', fallbackErr);
        setError('Failed to access both front and back cameras');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
      {error && <div className="error-message">{error}</div>}
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // 添加 muted 屬性以避免某些瀏覽器的自動播放限制
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