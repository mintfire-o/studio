// src/components/continuous-line-house-icon.tsx
import type { SVGProps } from 'react';
import React from 'react';

interface ContinuousLineHouseIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  // strokeWidth is part of SVGProps<SVGSVGElement>
}

const ContinuousLineHouseIcon = React.forwardRef<
  SVGSVGElement,
  ContinuousLineHouseIconProps
>(({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...props }, ref) => {
  // Path for the main house outline with chimney
  const housePathData = "M2 20 L6 20 L6 10 L12 4 L12 2 L14 2 L14 4 L18 10 L18 20 L22 20";
  // Path for the door (centered at the base)
  const doorPathData = "M10 20 L10 15 L14 15 L14 20"; // Simple rectangle for the door

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24" // Standard viewBox for icon consistency
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d={housePathData} />
      <path d={doorPathData} />
    </svg>
  );
});

ContinuousLineHouseIcon.displayName = 'ContinuousLineHouseIcon';
export default ContinuousLineHouseIcon;
