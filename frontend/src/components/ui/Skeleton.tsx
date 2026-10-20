import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
}) => {
  const roundedClass = {
    sm: 'skeleton-rounded-sm',
    md: 'skeleton-rounded-md',
    lg: 'skeleton-rounded-lg',
    full: 'skeleton-rounded-full',
  }[rounded];

  const style: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return <div className={`skeleton-loader ${roundedClass} ${className}`} style={style} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card-skeleton">
      <Skeleton height={24} width="60%" className="mb-3" />
      <Skeleton height={16} width="90%" className="mb-2" />
      <Skeleton height={16} width="40%" className="mb-4" />
      <div className="skeleton-row">
        <Skeleton height={36} width={100} rounded="md" />
        <Skeleton height={36} width={80} rounded="md" />
      </div>
    </div>
  );
};
