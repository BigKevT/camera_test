import React, { useEffect, useRef, useState } from 'react';

const CameraPage = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageUrl = canvas.toDataURL('image/jpeg', 1.0);
      setCapturedImage(imageUrl);
    }
  };

  useEffect(() => {
    const getPreferredCameraStream = async () => {
      try {
        setError(null);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

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

        for (const { device } of sortedDevices) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: device.deviceId },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                advanced: [
                  {
                    focusMode: 'continuous',
                    exposureMode: 'continuous',
                    whiteBalanceMode: 'continuous',
                    zoom: 1.0,
                    torch: false
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

              // 嘗試設置相機參數
              const videoTrack = stream.getVideoTracks()[0];
              if (videoTrack && videoTrack.getCapabilities) {
                const capabilities = videoTrack.getCapabilities();
                const settings = videoTrack.getSettings();
                
                // 如果支持手動對焦，設置較小的對焦距離
                if (capabilities.focusDistance) {
                  await videoTrack.applyConstraints({
                    advanced: [{
                      focusMode: 'manual',
                      focusDistance: 0.1
                    }]
                  });
                }
              }
            }
            return;
          } catch (err) {
            console.warn(`無法使用鏡頭：${device.label}`, err);
          }
        }

        // 使用默認後置相機
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [
              {
                focusMode: 'continuous',
                exposureMode: 'continuous',
                whiteBalanceMode: 'continuous',
                zoom: 1.0,
                torch: false
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
      <div className="camera-controls">
        <button onClick={takePhoto}>拍照</button>
      </div>
      {capturedImage && (
        <div className="captured-image">
          <img src={capturedImage} alt="Captured" />
        </div>
      )}
    </div>
  );
};

export default CameraPage;
