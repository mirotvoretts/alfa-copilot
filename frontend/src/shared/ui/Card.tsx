import type { ReactNode } from 'react';

export interface CardProps {
  readonly className?: string;
  readonly children: ReactNode;
}

export const Card = ({ className, children }: CardProps) => (
  <section className={className ? `card ${className}` : 'card'}>{children}</section>
);
