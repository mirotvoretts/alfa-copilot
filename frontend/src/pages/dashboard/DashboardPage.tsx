import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { AnalysisStreamOptions } from 'entities/analysis';
import { buildDailyBalances, generateTransactions } from 'entities/transaction';
import { RunAnalysisButton, useAnalysisRun } from 'features/run-analysis';
import { marinaScenario } from 'shared/config';
import { formatRubles } from 'shared/lib';
import { Card } from 'shared/ui';
import { BalanceChart } from 'widgets/balance-chart';
import { CopilotFeed } from 'widgets/copilot-feed';
import { AppHeader } from 'widgets/header';

export interface DashboardPageProps {
  readonly streamOptions?: AnalysisStreamOptions;
}

export const DashboardPage = ({ streamOptions = {} }: DashboardPageProps) => {
  const { events, status, start } = useAnalysisRun(marinaScenario, streamOptions);
  const balances = useMemo(
    () => buildDailyBalances(generateTransactions(marinaScenario), marinaScenario),
    [],
  );
  const todayBalance = balances[balances.length - 1]?.balance ?? 0;

  const forecastEvent = events.find((event) => event.kind === 'forecast_ready');
  const forecast = forecastEvent?.kind === 'forecast_ready' ? forecastEvent.forecast : null;

  return (
    <div className="dashboard">
      <AppHeader entrepreneur={marinaScenario.entrepreneur} monthsWithBank={4} />
      <main className="dashboard__grid">
        <Card className="chart-card">
          <header className="chart-card__header">
            <div>
              <span className="chart-card__eyebrow">Баланс сегодня</span>
              <motion.p
                className="chart-card__balance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {formatRubles(todayBalance)}
              </motion.p>
              {forecast?.daysUntilGap ? (
                <motion.p
                  className="chart-card__runway"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  при текущем оттоке запаса хватит примерно на {forecast.daysUntilGap} дней
                </motion.p>
              ) : (
                <p className="chart-card__runway chart-card__runway--muted">
                  оборот по эквайрингу за 4 месяца
                </p>
              )}
            </div>
          </header>
          <BalanceChart balances={balances} forecast={forecast} />
        </Card>
        <Card className="feed-card-panel">
          <header className="feed-panel__header">
            <h2>Лента Копилота</h2>
            <RunAnalysisButton status={status} onStart={start} />
          </header>
          <CopilotFeed events={events} status={status} />
        </Card>
      </main>
      <footer className="dashboard__footer">
        <p>
          АльфаКопилот даёт рекомендации, а не финансовые консультации. Решения всегда остаются за
          вами.
        </p>
      </footer>
    </div>
  );
};
