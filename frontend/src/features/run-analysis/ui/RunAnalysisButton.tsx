import { motion } from 'motion/react';
import type { AnalysisRunStatus } from '../model/useAnalysisRun';

export interface RunAnalysisButtonProps {
  readonly status: AnalysisRunStatus;
  readonly onStart: () => void;
}

const labelByStatus: Record<AnalysisRunStatus, string> = {
  idle: 'Запустить анализ',
  running: 'Копилот считает…',
  done: 'Повторить анализ',
};

export const RunAnalysisButton = ({ status, onStart }: RunAnalysisButtonProps) => (
  <motion.button
    type="button"
    className={`run-button run-button--${status}`}
    onClick={onStart}
    disabled={status === 'running'}
    {...(status === 'running' ? {} : { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 } })}
  >
    {status === 'running' ? <span className="run-button__spinner" aria-hidden /> : null}
    {labelByStatus[status]}
  </motion.button>
);
