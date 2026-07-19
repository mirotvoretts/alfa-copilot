import { motion } from 'motion/react';
import type { AnalysisEvent, RiskLevel } from 'entities/analysis';
import { formatRubles } from 'shared/lib';

const riskLabels: Record<RiskLevel, string> = {
  green: 'Зелёный уровень',
  yellow: 'Жёлтый уровень',
  red: 'Красный уровень',
};

const riskIcons: Record<RiskLevel, string> = {
  green: '●',
  yellow: '◆',
  red: '▲',
};

const trendLabels: Record<string, string> = {
  растет: '↗ растёт',
  падает: '↘ падает',
  стабилен: '→ стабилен',
};

export const StepResultBody = ({ event }: { readonly event: AnalysisEvent }) => {
  switch (event.kind) {
    case 'diagnostics_ready': {
      const { diagnostics } = event;
      return (
        <dl className="step-stats">
          <div className="step-stats__item">
            <dt>Средний чек</dt>
            <dd>{formatRubles(diagnostics.averageTicket)}</dd>
          </div>
          <div className="step-stats__item">
            <dt>Тренд выручки</dt>
            <dd>{trendLabels[diagnostics.trend] ?? diagnostics.trend}</dd>
          </div>
          <div className="step-stats__item">
            <dt>Буфер налички</dt>
            <dd>{diagnostics.runwayDays} дней</dd>
          </div>
          <div className="step-stats__item">
            <dt>Разовые траты</dt>
            <dd>{Math.round(diagnostics.largeExpenseShare * 100)}% расходов</dd>
          </div>
        </dl>
      );
    }
    case 'forecast_ready':
      return (
        <div className="step-forecast">
          {event.forecast.daysUntilGap !== null ? (
            <p className="step-forecast__days">
              <strong>{event.forecast.daysUntilGap}</strong>
              <span>дней до разрыва</span>
            </p>
          ) : null}
          <p>{event.narrative}</p>
        </div>
      );
    case 'risk_ready':
      return (
        <div className="step-risk">
          <motion.span
            className={`risk-badge risk-badge--${event.risk}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <span aria-hidden>{riskIcons[event.risk]}</span>
            {riskLabels[event.risk]}
          </motion.span>
          <p>{event.explanation}.</p>
        </div>
      );
    case 'recommendations_ready':
      return (
        <ol className="step-recommendations">
          {event.recommendations.map((recommendation) => (
            <li key={recommendation.productTitle}>
              <span className="step-recommendations__product">{recommendation.productTitle}</span>
              <p>{recommendation.action}.</p>
            </li>
          ))}
        </ol>
      );
    case 'message_ready':
      return (
        <div className="step-message">
          <p className="step-message__bubble">{event.message.text}</p>
          <span className="step-message__cta">{event.message.ctaLabel}</span>
        </div>
      );
    case 'step_started':
      return null;
  }
};
