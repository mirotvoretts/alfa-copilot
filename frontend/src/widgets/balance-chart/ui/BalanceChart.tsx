import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { CashGapForecast } from 'entities/analysis';
import type { DailyBalance } from 'entities/transaction';
import { formatRubles, formatRublesCompact } from 'shared/lib';
import { balancesToPath, createChartLayout, xForDay, yForBalance } from '../model/chartGeometry';

export interface BalanceChartProps {
  readonly balances: readonly DailyBalance[];
  readonly forecast: CashGapForecast | null;
}

interface HoverPoint {
  readonly x: number;
  readonly y: number;
  readonly date: string;
  readonly balance: number;
}

const monthLabels = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

const formatDayLabel = (isoDate: string): string => {
  const date = new Date(Date.parse(isoDate));
  return `${date.getUTCDate()} ${monthLabels[date.getUTCMonth()] ?? ''}`;
};

const criticalZoneCeiling = 8_000;
const projectionPaddingDays = 24;

export const BalanceChart = ({ balances, forecast }: BalanceChartProps) => {
  const reducedMotion = useReducedMotion() ?? false;
  const [hoverPoint, setHoverPoint] = useState<HoverPoint | null>(null);
  const layout = useMemo(() => createChartLayout(balances, projectionPaddingDays), [balances]);
  const historyPath = useMemo(() => balancesToPath(layout, balances), [layout, balances]);
  const todayPoint = balances[balances.length - 1];

  if (!todayPoint) {
    return null;
  }

  const todayX = xForDay(layout, balances.length - 1);
  const todayY = yForBalance(layout, todayPoint.balance);
  const baselineY = yForBalance(layout, 0);
  const gapDays = forecast?.daysUntilGap ?? null;
  const gapX = gapDays !== null ? xForDay(layout, balances.length - 1 + gapDays) : null;

  const gridBalances = [0.25, 0.5, 0.75, 1].map((share) => Math.round(layout.maxBalance * share));
  const monthTicks = balances
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => point.date.endsWith('-01'));

  const handleHover = (event: React.MouseEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * layout.width;
    const domainDays = layout.totalDays - 1 + layout.projectionDays;
    const innerWidth = layout.width - layout.left - layout.right;
    const dayOffset = Math.round(((relativeX - layout.left) / innerWidth) * domainDays);
    const clampedOffset = Math.min(balances.length - 1, Math.max(0, dayOffset));
    const point = balances[clampedOffset];
    if (!point) {
      return;
    }
    setHoverPoint({
      x: xForDay(layout, clampedOffset),
      y: yForBalance(layout, point.balance),
      date: point.date,
      balance: point.balance,
    });
  };

  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={`Баланс Марины по дням, сегодня ${formatRubles(todayPoint.balance)}`}
      >
        <defs>
          <linearGradient id="history-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f0f0f" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0f0f0f" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridBalances.map((balance) => (
          <g key={balance}>
            <line
              className="chart__grid-line"
              x1={layout.left}
              x2={layout.width - layout.right}
              y1={yForBalance(layout, balance)}
              y2={yForBalance(layout, balance)}
            />
            <text
              className="chart__axis-label"
              x={layout.left - 8}
              y={yForBalance(layout, balance) + 4}
              textAnchor="end"
            >
              {formatRublesCompact(balance)}
            </text>
          </g>
        ))}

        {monthTicks.map(({ point, index }) => (
          <text
            key={point.date}
            className="chart__axis-label"
            x={xForDay(layout, index)}
            y={layout.height - 12}
            textAnchor="middle"
          >
            {monthLabels[new Date(Date.parse(point.date)).getUTCMonth()]}
          </text>
        ))}

        {forecast && gapDays !== null ? (
          <motion.rect
            className="chart__critical-zone"
            x={todayX}
            width={layout.width - layout.right - todayX}
            y={yForBalance(layout, criticalZoneCeiling)}
            height={baselineY - yForBalance(layout, criticalZoneCeiling)}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
          />
        ) : null}

        <path
          className="chart__history-fill"
          d={`${historyPath} L${todayX},${baselineY} L${layout.left},${baselineY} Z`}
          fill="url(#history-fill)"
        />

        <motion.path
          className="chart__history-line"
          d={historyPath}
          initial={reducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.7, ease: 'easeInOut' }}
        />

        <line
          className="chart__today-line"
          x1={todayX}
          x2={todayX}
          y1={layout.top}
          y2={baselineY}
        />
        <text className="chart__today-label" x={todayX} y={layout.top - 6} textAnchor="middle">
          сегодня
        </text>

        {forecast && gapDays !== null && gapX !== null ? (
          <g>
            <motion.path
              className="chart__projection-line"
              d={`M${todayX.toFixed(1)},${todayY.toFixed(1)} L${gapX.toFixed(1)},${baselineY.toFixed(1)}`}
              initial={reducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: reducedMotion ? 0 : 0.3 }}
            />
            <motion.circle
              className="chart__gap-marker"
              cx={gapX}
              cy={baselineY}
              r={5}
              initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: reducedMotion ? 0 : 1.2,
                type: 'spring',
                stiffness: 260,
                damping: 16,
              }}
            />
            {forecast.gapDate ? (
              <text
                className="chart__gap-label"
                x={Math.min(gapX - 10, layout.width - 24)}
                y={baselineY + 16}
                textAnchor="end"
              >
                разрыв ~{formatDayLabel(forecast.gapDate)}
              </text>
            ) : null}
          </g>
        ) : null}

        <circle
          className="chart__today-dot chart__today-dot--pulse"
          cx={todayX}
          cy={todayY}
          r={9}
        />
        <circle className="chart__today-dot" cx={todayX} cy={todayY} r={4.5} />

        {hoverPoint ? (
          <g>
            <line
              className="chart__crosshair"
              x1={hoverPoint.x}
              x2={hoverPoint.x}
              y1={layout.top}
              y2={baselineY}
            />
            <circle className="chart__hover-dot" cx={hoverPoint.x} cy={hoverPoint.y} r={4} />
          </g>
        ) : null}

        <rect
          x={layout.left}
          y={layout.top}
          width={layout.width - layout.left - layout.right}
          height={layout.height - layout.top - layout.bottom}
          fill="transparent"
          onMouseMove={handleHover}
          onMouseLeave={() => setHoverPoint(null)}
        />
      </svg>
      {hoverPoint ? (
        <figcaption
          className="chart__tooltip"
          style={{
            left: `${((hoverPoint.x / layout.width) * 100).toFixed(1)}%`,
            top: `${((hoverPoint.y / layout.height) * 100).toFixed(1)}%`,
          }}
        >
          <span>{formatDayLabel(hoverPoint.date)}</span>
          <strong>{formatRubles(hoverPoint.balance)}</strong>
        </figcaption>
      ) : null}
    </figure>
  );
};
