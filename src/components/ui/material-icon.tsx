import React from 'react';
import { cn } from '@/lib/utils';

interface MaterialIconProps {
  name: string;
  size?: number | string;
  className?: string;
  fill?: boolean;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size = 18,
  className,
  fill = false,
}) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  return (
    <span
      className={cn("material-symbols-outlined select-none shrink-0 inline-block align-middle", className)}
      style={{
        fontSize: sizeValue,
        fontVariationSettings: fill ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
