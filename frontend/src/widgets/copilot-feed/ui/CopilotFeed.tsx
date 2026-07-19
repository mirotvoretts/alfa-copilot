import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { AnalysisEvent } from 'entities/analysis';
import type { AnalysisRunStatus } from 'features/run-analysis';
import { buildFeedItems } from '../model/buildFeedItems';
import { StepResultBody } from './StepResultBody';

export interface CopilotFeedProps {
  readonly events: readonly AnalysisEvent[];
  readonly status: AnalysisRunStatus;
}

export const CopilotFeed = ({ events, status }: CopilotFeedProps) => {
  const items = buildFeedItems(events);
  const listRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list && typeof list.scrollTo === 'function') {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    }
  }, [events.length]);

  if (status === 'idle' && items.length === 0) {
    return (
      <div className="feed feed--empty">
        <p className="feed__hint">
          Запустите анализ — Копилот пройдёт по пяти шагам и покажет каждый результат по мере
          готовности.
        </p>
      </div>
    );
  }

  return (
    <ol className="feed" aria-live="polite" ref={listRef}>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.step}
            className={`feed-card ${item.event ? 'feed-card--done' : 'feed-card--thinking'}`}
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            layout
          >
            <header className="feed-card__header">
              <span className="feed-card__number">{item.stepNumber}</span>
              <h3>{item.title}</h3>
            </header>
            {item.event ? (
              <StepResultBody event={item.event} />
            ) : (
              <p className="feed-card__thinking">
                анализирую
                <span className="thinking-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
              </p>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
};
