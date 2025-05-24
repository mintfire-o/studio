
'use client';

import React, { useEffect, useState } from 'react';
import { Palette } from 'lucide-react'; // Using Palette as a placeholder/related icon

// Style will be in globals.css or inline for simplicity here
const StylusTextAnimation: React.FC = () => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100); // Short delay to ensure styles are applied
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <style jsx global>{`
        .stylus-text-svg {
          width: 100%;
          max-width: 400px; /* Adjust as needed */
          height: auto; /* Maintain aspect ratio */
          font-family: 'Brush Script MT', 'Brush Script Std', 'cursive'; /* Example cursive font */
        }

        .stylus-text-svg text {
          font-size: 80px; /* Adjust for desired text size */
          fill: none;
          stroke: hsl(var(--primary)); /* Use primary theme color for stroke */
          stroke-width: 2; /* Adjust for thickness */
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .stylus-text-svg .text-path {
          stroke-dasharray: 1000; /* A large enough value */
          stroke-dashoffset: 1000; /* Start with text invisible */
          animation: drawEffect 4s ease-in-out forwards;
          animation-delay: 0.5s; /* Delay before animation starts */
        }
        
        .stylus-text-svg .text-path.animated {
           /* This class could be used to trigger animation if preferred over direct style */
        }

        @keyframes drawEffect {
          to {
            stroke-dashoffset: 0; /* Draw the text */
          }
        }
        
        /* Fallback for fonts */
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .stylus-text-svg {
          font-family: 'Dancing Script', cursive;
        }
      `}</style>
      
      <Palette size={52} className="text-primary mb-3" />
      <svg viewBox="0 0 400 100" className="stylus-text-svg">
        {/* Text is split for potential staggered animation if desired, or keep as one */}
        <text x="50%" y="50%" dy=".35em" textAnchor="middle">
          <tspan className={`text-path ${isAnimated ? 'animated' : ''}`}>
            La Interior
          </tspan>
        </text>
      </svg>
    </div>
  );
};

export default StylusTextAnimation;
