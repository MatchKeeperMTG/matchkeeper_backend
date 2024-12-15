'use client'
import React from 'react';

export default function AnimatedLogo({ style = {}, className = "" }) {
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
    width: '40%',
    height: 'auto',
    animation: 'floatAndRotate 3s ease-in-out infinite',
    marginTop: '6vf',
    ...style
  };

  return (
    <a href="/" style={logoStyle}>
      <img
        src="/logo.png"
        alt="Match Keeper Logo"
        className={className}
      />
    </a>
  );
}