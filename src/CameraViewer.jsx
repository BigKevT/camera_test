import React, { useEffect, useRef, useState } from 'react';

const CameraViewer = () => {
  const videoRef = useRef(null);
  const [info, setInfo] = useState('載入中...');

  // 🧠 簡單的 User Agent 解析函式
  const detectDevice = () => {
    const ua = navigator.userAgent;

    if (/android/i.test(ua)) return 'Android';
    if (/iphone/i.test(ua)) return 'iPhone';
    if (/ipad/i.test(ua)) return 'iPad';
    if (/macintosh/i.test(ua)) return 'Mac';
    if (/windows/i.test(ua)) return 'Windows';
    if (/linux/i.test(ua)) return 'Linux';

    return '未知裝置';
  };

  useEffect(() => {
    const gatherInfo = async () => {
      try {
        const lines = [];

        // 🧠 User Agent 與裝置類型
        lines.push(`🧠 User Agent:\n${navigator.userAgent}\n`);
        lines.push(`📱 判斷裝置平台: ${detectDevice()}\n`);

        // 🎥 啟用相機並取得 video track
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          lines.push('🎥 MediaTrack Settings:');
          const settings = videoTrack.getSettings();
          Object.entries(settings).forEach(([key, value]) => {
            lines.push(`• ${key}: ${value}`);
          });

          if (typeof videoTrack.getCapabilities === 'function') {
            lines.push('\n📈 MediaTrack Capabilities:');
            const capabilities = videoTrack.getCapabilities();
            Object.entries(capabilities).forEach(([key, value]) => {
              lines.push(`• ${key}: ${JSON.stringify(value)}`);
            });
          }
        }

        // 📋 所有相機裝置
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        lines.push('\n📋 可用的相機裝置:');
        videoInputs.forEach((device, idx) => {
          lines.push(`相機 ${idx + 1}:`);
          lines.push(`• label: ${device.label || '(無法取得)'}`);
          lines.push(`• deviceId: ${device.deviceId}\n`);
        });

        setInfo(lines.join('\n'));
      } catch (err) {
        setInfo(`❌ 錯誤：${err.message}`);
      }
    };

    gatherInfo();
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h2>📷 相機畫面</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', maxWidth: '500px', border: '1px solid black', borderRadius: '8px' }}
      />

      <h2 style={{ marginTop: '20px' }}>📦 裝置詳細資訊</h2>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '500px',
        }}
      >
        {info}
      </pre>
    </div>
  );
};

export default CameraViewer;
