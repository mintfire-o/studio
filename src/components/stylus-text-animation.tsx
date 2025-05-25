
'use client';

import React from 'react';
import ContinuousLineHouseIcon from '@/components/continuous-line-house-icon'; // Changed import

const StylusTextAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-4">
      <ContinuousLineHouseIcon size={52} className="text-primary mb-3" /> {/* Changed component */}
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
