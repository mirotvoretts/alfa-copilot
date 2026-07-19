import type { AnalysisEvent, AnalysisStepId } from 'entities/analysis';

export interface FeedItem {
  readonly step: AnalysisStepId;
  readonly stepNumber: number;
  readonly title: string;
  readonly event: AnalysisEvent | null;
}

const stepOrder: readonly AnalysisStepId[] = [
  'diagnostics',
  'forecast',
  'risk',
  'recommendation',
  'message',
];

export const stepTitles: Record<AnalysisStepId, string> = {
  diagnostics: 'Диагностика',
  forecast: 'Прогноз кассового разрыва',
  risk: 'Уровень риска',
  recommendation: 'Что делать',
  message: 'Сообщение от Копилота',
};

const stepOfResult = (event: AnalysisEvent): AnalysisStepId | null => {
  switch (event.kind) {
    case 'diagnostics_ready':
      return 'diagnostics';
    case 'forecast_ready':
      return 'forecast';
    case 'risk_ready':
      return 'risk';
    case 'recommendations_ready':
      return 'recommendation';
    case 'message_ready':
      return 'message';
    case 'step_started':
      return null;
  }
};

export const buildFeedItems = (events: readonly AnalysisEvent[]): FeedItem[] => {
  const items: FeedItem[] = [];
  for (const event of events) {
    if (event.kind === 'step_started') {
      items.push({
        step: event.step,
        stepNumber: stepOrder.indexOf(event.step) + 1,
        title: stepTitles[event.step],
        event: null,
      });
      continue;
    }
    const step = stepOfResult(event);
    if (step === null) {
      continue;
    }
    const itemIndex = items.findIndex((item) => item.step === step);
    const completedItem: FeedItem = {
      step,
      stepNumber: stepOrder.indexOf(step) + 1,
      title: stepTitles[step],
      event,
    };
    if (itemIndex >= 0) {
      items[itemIndex] = completedItem;
    } else {
      items.push(completedItem);
    }
  }
  return items;
};
