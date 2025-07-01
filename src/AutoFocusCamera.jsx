import React, { useRef, useState, useEffect } from 'react';


/**
 * React component for auto-focused photo capture in Chrome on Android.
 */
export default function AutoFocusCamera() {
  const videoRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const streamRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  async function capturePhoto() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    streamRef.current = stream;
    const track = stream.getVideoTracks()[0];
    const videoEl = videoRef.current;
    videoEl.srcObject = stream;
    videoEl.play().catch(() => {});

    // Try continuous focus
    const caps = track.getCapabilities();
    if (caps.focusMode?.includes('continuous')) {
      try {
        await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
      } catch (_) {}
    }

    const imageCapture = new window.ImageCapture(track);
    let photoCaps = {};
    try {
      photoCaps = await imageCapture.getPhotoCapabilities();
    } catch (_) {}

    // Single-shot autofocus
    if (photoCaps.focusMode?.includes('single-shot')) {
      try {
        await imageCapture.setOptions({ focusMode: 'single-shot' });
      } catch (_) {}
    }
    // Manual sweep fallback
    else if (
      typeof photoCaps.minFocusDistance === 'number' &&
      typeof photoCaps.maxFocusDistance === 'number' &&
      typeof photoCaps.focusDistanceStep === 'number'
    ) {
      const distances = [
        photoCaps.minFocusDistance,
        (photoCaps.minFocusDistance + photoCaps.maxFocusDistance) / 2,
        photoCaps.maxFocusDistance
      ];
      let best = { d: distances[0], sharp: -Infinity };
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      for (let d of distances) {
        await imageCapture.setOptions({ focusMode: 'manual', focusDistance: d });
        const frame = await imageCapture.grabFrame();
        canvas.width = frame.displayWidth;
        canvas.height = frame.displayHeight;
        ctx.drawImage(frame, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let mean = 0, variance = 0;
        const count = imgData.data.length / 4;
        for (let i = 0; i < imgData.data.length; i += 4) {
          mean += 0.299 * imgData.data[i] + 0.587 * imgData.data[i + 1] + 0.114 * imgData.data[i + 2];
        }
        mean /= count;
        for (let i = 0; i < imgData.data.length; i += 4) {
          const lum = 0.299 * imgData.data[i] + 0.587 * imgData.data[i + 1] + 0.114 * imgData.data[i + 2];
          variance += (lum - mean) ** 2;
        }
        variance /= count;
        if (variance > best.sharp) best = { d, sharp: variance };
      }
      await imageCapture.setOptions({ focusMode: 'manual', focusDistance: best.d });
    }

    // Take the photo
    let blob;
    try {
      blob = await imageCapture.takePhoto();
    } catch (_) {
      const frame = await imageCapture.grabFrame();
      const cvs = document.createElement('canvas');
      cvs.width = frame.displayWidth;
      cvs.height = frame.displayHeight;
      cvs.getContext('2d').drawImage(frame, 0, 0);
      const dataUrl = cvs.toDataURL('image/jpeg');
      const res = await fetch(dataUrl);
      blob = await res.blob();
    }

    // Clean up and display
    track.stop();
    videoEl.srcObject = null;
    const url = URL.createObjectURL(blob);
    setPhotoUrl(url);
  }

  return (
    <div className="space-y-4 p-4">
      <video
        ref={videoRef}
        className="w-full rounded-lg shadow"
        playsInline
        muted
      />
      <button onClick={capturePhoto} className="w-full">
        📸 Take Photo
      </button>
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Captured"
          className="w-full rounded-lg shadow"
        />
      )}
    </div>
  );
}
