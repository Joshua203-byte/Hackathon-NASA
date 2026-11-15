import type { ReactNode } from 'react';

/** Tooltip HTML posicionado dentro de un contenedor `position: relative`. x, y en % del contenedor. */
export function ChartTooltip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  const alignRight = x > 60;
  return (
    <div
      className="chart-tooltip"
      role="status"
      style={{
        left: alignRight ? undefined : `calc(${x}% + 12px)`,
        right: alignRight ? `calc(${100 - x}% + 12px)` : undefined,
        top: `${Math.max(0, Math.min(y, 70))}%`,
      }}
    >
      {children}
    </div>
  );
}
