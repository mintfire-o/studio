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
  // This path attempts to draw a house with a chimney in a continuous line style
  // M0,20 -> L4,20 (ground-left) -> L4,10 (left-wall) -> L11,4 (roof-left-slope-part1)
  // -> L11,2 (chimney-left-up) -> L13,2 (chimney-top) -> L13,4 (chimney-right-down)
  // -> L20,10 (roof-right-slope) -> L20,20 (right-wall) -> L24,20 (ground-right)
  const pathData = "M0 20 L4 20 L4 10 L11 4 L11 2 L13 2 L13 4 L20 10 L20 20 L24 20";

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
      <path d={pathData} />
    </svg>
  );
});

ContinuousLineHouseIcon.displayName = 'ContinuousLineHouseIcon';
export default ContinuousLineHouseIcon;
