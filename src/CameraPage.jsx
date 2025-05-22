import React, { useEffect, useRef, useState } from 'react';

const CameraPage = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [cameraInfo, setCameraInfo] = useState('');

  useEffect(() => {
    const getPreferredCameraStream = async () => {
      try {
        setError(null);
        // 先停止現有的相機流
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");

        // 定義相機優先級和關鍵字
        const priorityList = [
          { name: "macro", keywords: ["macro", "微距", "近拍"] },
          { name: "ultrawide", keywords: ["ultrawide", "超廣角", "wide"] },
          { name: "telephoto", keywords: ["telephoto", "長焦", "tele"] },
          { name: "back", keywords: ["back", "後置", "rear"] }
        ];

        // 為每個相機計算優先級分數
        const scoredDevices = videoDevices.map(device => {
          const label = device.label.toLowerCase();
          let score = 999; // 默認最低優先級
          let matchedType = "other";

          // 檢查每個優先級類別
          for (let i = 0; i < priorityList.length; i++) {
            const { name, keywords } = priorityList[i];
            if (keywords.some(keyword => label.includes(keyword))) {
              score = i;
              matchedType = name;
              break;
            }
          }

          return {
            device,
            score,
            type: matchedType
          };
        });

        // 按優先級排序
        const sortedDevices = scoredDevices.sort((a, b) => a.score - b.score);

        // 記錄找到的相機信息
        const cameraInfo = sortedDevices.map(({ device, type }) => 
          `相機: ${device.label} (類型: ${type})`
        ).join('\n');
        setCameraInfo(cameraInfo);

        // 嘗試使用每個相機，從最高優先級開始
        for (const { device } of sortedDevices) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: device.deviceId },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                advanced: [
                  {
                    focusMode: 'manual',
                    focusDistance: 0.1,
                    exposureMode: 'continuous',
                    whiteBalanceMode: 'continuous',
                    zoom: 1.0
                  }
                ]
              }
            });

            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              await videoRef.current.play().catch(err => {
                console.error('Error playing video:', err);
                throw new Error('Failed to start video playback');
              });
            }
            console.log(`成功使用鏡頭：${device.label}`);
            return;
          } catch (err) {
            console.warn(`無法使用鏡頭：${device.label}`, err);
          }
        }

        // 如果所有相機都失敗，使用默認後置相機
        console.log('嘗試使用默認後置相機');
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [
              {
                focusMode: 'manual',
                focusDistance: 0.1,
                exposureMode: 'continuous',
                whiteBalanceMode: 'continuous',
                zoom: 1.0
              }
            ]
          }
        });

        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
            throw new Error('Failed to start video playback');
          });
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("無法存取相機，請確認權限是否開啟");
      }
    };

    getPreferredCameraStream();

    // 清理函數
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="camera-page">
      {error && <div className="error-message">{error}</div>}
      <div className="camera-container">
        <video 
          ref={videoRef} 
          playsInline 
          muted 
          autoPlay 
        />
      </div>
      {cameraInfo && (
        <div className="camera-info">
          {cameraInfo}
        </div>
      )}
    </div>
  );
};

export default CameraPage;
