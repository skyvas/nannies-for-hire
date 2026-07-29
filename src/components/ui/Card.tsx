import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, padded = true, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200',
          padded && 'p-6',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
