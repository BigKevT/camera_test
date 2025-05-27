import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const ReactCameraPage = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // 拍照 function：從原始 video 擷取畫面，解析度不會變形
  const capture = useCallback(() => {
    const video = webcamRef.current.video;
  
    if (video) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
  
      // 取中間最小邊作為裁切邊長
      const cropSize = Math.min(videoWidth, videoHeight);
      const cropX = (videoWidth - cropSize) / 2;
      const cropY = (videoHeight - cropSize) / 2;
  
      const canvas = document.createElement('canvas');
      canvas.width = cropSize;
      canvas.height = cropSize;
  
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        video,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        cropSize,
        cropSize
      );
  
      const imageData = canvas.toDataURL('image/jpeg', 1.0);
      setCapturedImage(imageData);
    } else {
      alert('無法取得攝影機畫面');
    }
  }, []);
  

  const videoConstraints = {
    facingMode: 'environment',
    width: { ideal: 1920 },
    height: { ideal: 1440 },
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* 4:3 取景框 */}
      <div
        style={{
          width: '360px',
          height: '270px', // 4:3
          overflow: 'hidden',
          borderRadius: '0.5rem',
          backgroundColor: 'black',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          videoConstraints={videoConstraints}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* 拍照按鈕 */}
      <button
        onClick={capture}
        style={{
          backgroundColor: '#3B82F6',
          color: 'white',
          padding: '0.5rem 1.25rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#2563EB')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#3B82F6')}
      >
        拍照
      </button>

      {/* 顯示拍攝照片 */}
      {capturedImage && (
        <div style={{ width: '360px', textAlign: 'center' }}>
          <p style={{ marginBottom: '0.5rem' }}>拍攝的照片：</p>
          <img
            src={capturedImage}
            alt="captured"
            style={{
              width: '100%',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ReactCameraPage;
