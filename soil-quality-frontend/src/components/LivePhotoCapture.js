
import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';

const LivePhotoCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    if (onCapture) onCapture(imageSrc);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('/background5.png')" }}>
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="flex flex-col items-center w-full relative z-10 max-w-md mx-auto">
      {!imgSrc ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-xl shadow-lg mb-6 w-full"
          />
          <motion.button
            onClick={capture}
            whileHover={{ scale: 1.05, backgroundColor: "#059669" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-all"
          >
            Capture Photo
          </motion.button>
        </>
      ) : (
        <>
          <img src={imgSrc} alt="Captured" className="rounded-xl shadow-lg mb-6 w-full" />
          <motion.button
            onClick={() => setImgSrc(null)}
            whileHover={{ scale: 1.05, backgroundColor: "#6b7280" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gray-500 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-md transition-all"
          >
            Retake
          </motion.button>
        </>
      )}
      </div>
    </div>
  );
};

export default LivePhotoCapture;
