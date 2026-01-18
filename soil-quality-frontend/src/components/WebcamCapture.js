import React, { useRef, useState } from 'react';

const WebcamCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);

  React.useEffect(() => {
    let stream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreaming(true);
        }
      } catch (err) {
        setStreaming(false);
      }
    };
    startCamera();
    return () => {
      if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 400, 200);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCapture(dataUrl);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <video ref={videoRef} width={400} height={200} autoPlay playsInline className="rounded-xl border border-green-300 bg-black" style={{ display: streaming ? 'block' : 'none' }} />
      <canvas ref={canvasRef} width={400} height={200} style={{ display: 'none' }} />
      <button type="button" onClick={handleCapture} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-xl shadow-md transition-all w-full mt-2">Capture</button>
      {!streaming && <span className="text-red-500 text-sm mt-2">Unable to access camera</span>}
    </div>
  );
};

export default WebcamCapture;
