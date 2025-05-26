import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const ReactCameraPage = () => {
  const webcamRef = useRef(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // 獲取所有相機設備
  const getCameraDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      
      const priorityList = [
        { name: "macro", keywords: ["macro", "微距", "近拍"] },
        { name: "ultrawide", keywords: ["ultrawide", "超廣角", "wide"] },
        { name: "telephoto", keywords: ["telephoto", "長焦", "tele"] },
        { name: "back", keywords: ["back", "後置", "rear"] }
      ];

      const scoredDevices = videoDevices.map(device => {
        const label = device.label.toLowerCase();
        let score = 999;
        let matchedType = "other";

        for (let i = 0; i < priorityList.length; i++) {
          const { name, keywords } = priorityList[i];
          if (keywords.some(keyword => label.includes(keyword))) {
            score = i;
            matchedType = name;
            break;
          }
        }

        return { device, score, type: matchedType };
      });

      const sortedDevices = scoredDevices.sort((a, b) => a.score - b.score);
      setCameraDevices(sortedDevices);
      
      // 自動選擇第一個設備
      if (sortedDevices.length > 0) {
        setSelectedDeviceId(sortedDevices[0].device.deviceId);
      }
    } catch (err) {
      console.error("Error getting camera devices:", err);
      setError("無法獲取相機設備列表");
    }
  }, []);

  // 拍照功能
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({width: 1920, height: 1920});
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  // 相機配置
  const videoConstraints = {
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: 'environment',
    focusMode: 'continuous',
    exposureMode: 'continuous',
    whiteBalanceMode: 'continuous'
  };

  return (
    <div className="camera-page">
      {error && <div className="error-message">{error}</div>}
      <div className="camera-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={() => setError(null)}
          onUserMediaError={(err) => setError("無法存取相機，請確認權限是否開啟")}
          mirrored={false}
          className="webcam"
        />
      </div>
      <div className="camera-controls">
        <button onClick={capture}>拍照</button>
      </div>
      {capturedImage && (
        <div className="captured-image">
          <img src={capturedImage} alt="Captured" />
        </div>
      )}
    </div>
  );
};

export default ReactCameraPage;
