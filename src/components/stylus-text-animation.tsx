
'use client';

import React from 'react';
import { Palette } from 'lucide-react';

const StylusTextAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

        .stylus-text-svg {
          width: 100%;
          max-width: 400px; /* Adjust as needed */
          height: auto; /* Maintain aspect ratio */
          font-family: 'Dancing Script', cursive; /* Prioritize Dancing Script */
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
          stroke-dasharray: 1000; /* A large enough value for the text "La Interior" */
          stroke-dashoffset: 1000; /* Start with text invisible (fully dashed) */
          animation: drawEffect 4s ease-in-out forwards;
          animation-delay: 0.5s; /* Delay before animation starts */
        }

        @keyframes drawEffect {
          to {
            stroke-dashoffset: 0; /* Animate to fully drawn */
          }
        }
      `}</style>
      
      <Palette size={52} className="text-primary mb-3" />
      <svg viewBox="0 0 400 100" className="stylus-text-svg">
        <text x="50%" y="50%" dy=".35em" textAnchor="middle">
          <tspan className="text-path">
            La Interior
          </tspan>
        </text>
      </svg>
    </div>
  );
};

export default StylusTextAnimation;
