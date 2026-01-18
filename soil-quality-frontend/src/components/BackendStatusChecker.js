import React, { useEffect, useState } from 'react';

export default function BackendStatusChecker() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/status')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setStatus(data.status);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not connect to backend.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Checking backend status...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  return <div style={{ color: 'green', fontWeight: 'bold' }}>{status}</div>;
}
