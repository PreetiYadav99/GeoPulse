import React from 'react';

const LoadingState = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-40">
    <div className="loader ease-linear rounded-full border-8 border-t-8 border-green-600 h-16 w-16"></div>
  </div>
);

export default LoadingState;
