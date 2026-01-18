import React from 'react';

const ValidationModal = ({ onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
      <h2 className="text-xl font-bold mb-4">Validation Successful</h2>
      <p>Your data has been successfully submitted!</p>
      <button onClick={onClose} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Close
      </button>
    </div>
  </div>
);

export default ValidationModal;
