import React, { useEffect, useState } from 'react';

const FadeMessage = ({ message, duration = 1000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setVisible(true);
    }, 10);

    const fadeOutTimer = setTimeout(() => {
      setVisible(false);
    }, duration - 500); 

    const cleanupTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(cleanupTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        backgroundColor: '#48bb78',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        opacity: visible ? 0.9 : 0,
        transform: visible ? 'translateY(40px)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
};

export default FadeMessage;
