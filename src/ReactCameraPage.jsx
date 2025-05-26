import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const ReactCameraPage = () => {
  const webcamRef = useRef(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // 拍照功能
  const capture = useCallback(() => {
    if (webcamRef.current) {
      // const imageSrc = webcamRef.current.getScreenshot({
      //   width: 1080,
      //   height: 1080,
      //   type: 'image/jpeg',
      //   quality: 1.0
      // });
      const imageSrc = webcamRef.current.getScreenshot({width: 1920, height: 1080})
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  // 相機配置
  const videoConstraints = {
    // width: { ideal: 1920 },
    // height: { ideal: 1080 },
    width: 1920,
    height: 1080,
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
          imageSmoothing={true}
          imageSmoothingQuality="high"
        />
      </div>
      <div className="camera-controls">
        <button onClick={capture}>拍照</button>
      </div>
      {capturedImage && (
        <div>
          <img style={{width: "50%"}} src={capturedImage} alt="Captured" />
        </div>
      )}
    </div>
  );
};

export default ReactCameraPage;
