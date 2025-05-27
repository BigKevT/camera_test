import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const ReactCameraPage = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot({width: 1920, height: 1440});
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

  const videoConstraints = {
    facingMode: 'environment',
    width: 1920,
    height: 1440,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
      }}
    >
      {/* 取景框 */}
      <div
        style={{
          width: '360px',
          height: '240px', // 6:4 比例
          overflow: 'hidden',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          backgroundColor: 'black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={1}
          videoConstraints={videoConstraints}
          style={{
            width: '100%',         // 滿版寬度
            height: 'auto',        // 高度自動，維持比例
            objectFit: 'cover',    // 補裁切，但不會拉伸
          }}
        />
      </div>

      <button
        onClick={capture}
        style={{
          backgroundColor: '#3B82F6',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#2563EB')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#3B82F6')}
      >
        拍照
      </button>

      {capturedImage && (
        <div style={{ width: '360px' }}>
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
