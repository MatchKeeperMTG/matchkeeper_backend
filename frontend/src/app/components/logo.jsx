'use client'
import React from 'react';

export default function AnimatedLogo({ style = {} }) {
  // Inject animation keyframes
  React.useEffect(() => {
    const floatKeyframes = `
      @keyframes floatAndRotate {
        0% {
          transform: translateY(0px) rotate(-2deg);
        }
        50% {
          transform: translateY(-10px) rotate(2deg);
        }
        100% {
          transform: translateY(0px) rotate(-2deg);
        }
      }
    `;
    
    const styleTag = document.createElement('style');
    styleTag.innerHTML = floatKeyframes;
    document.head.appendChild(styleTag);

    // Cleanup on unmount
    return () => styleTag.remove();
  }, []);

  const logoStyle = {
    width: '100%',
    height: 'auto',
    animation: 'floatAndRotate 3s ease-in-out infinite',
    ...style
  };

  return (
    <img
      src="/logo.png"
      alt="Match Keeper Logo"
      style={logoStyle}
    />
  );
}