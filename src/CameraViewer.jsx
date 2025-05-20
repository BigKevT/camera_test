import React, { useEffect, useRef, useState } from 'react';

const CameraViewer = () => {
  const videoRef = useRef(null);
  const [cameraInfo, setCameraInfo] = useState('讀取中...');

  // 啟用相機
  useEffect(() => {
    const startCameraAndListDevices = async () => {
      try {
        // 1️⃣ 先取得相機權限（這一步也會觸發權限提示）
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
  
        // 2️⃣ 取得設備清單，這時 label 才會有值
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
  
        if (cameras.length === 0) {
          setCameraInfo('找不到任何相機裝置。');
          return;
        }
  
        const info = cameras.map((cam, index) => 
          `📷 相機 ${index + 1}：
  • 標籤：${cam.label || '（無法取得）'}
  • 裝置ID：${cam.deviceId}`
        ).join('\n\n');
  
        setCameraInfo(info);
      } catch (err) {
        setCameraInfo('錯誤：' + err.message);
      }
    };
  
    startCameraAndListDevices();
  }, []);
  

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>📷 即時相機畫面</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '500px', border: '2px solid #333', borderRadius: '8px' }} />

      <h2 style={{ marginTop: '20px' }}>📋 可用相機裝置資訊</h2>
      <pre style={{ background: '#fff', padding: '15px', border: '1px solid #ccc', borderRadius: '6px', whiteSpace: 'pre-wrap', maxWidth: '500px' }}>
        {cameraInfo}
      </pre>
    </div>
  );
};

export default CameraViewer;
