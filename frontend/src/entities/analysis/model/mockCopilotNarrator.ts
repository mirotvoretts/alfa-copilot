import type { DemoScenario } from 'shared/config';
import type {
  CashGapForecast,
  Diagnostics,
  ProactiveMessage,
  Recommendation,
  RiskLevel,
} from './types';

export const composeForecastNarrative = (forecast: CashGapForecast): string => {
  if (forecast.daysUntilGap === null) {
    return 'При текущем денежном потоке кассовый разрыв не прогнозируется, уверенность высокая.';
  }
  return `При сохранении текущего темпа трат баланс уйдет в критическую зону примерно через ${forecast.daysUntilGap} дней (около ${Math.round(forecast.dailyBurn)} ₽ чистого оттока в день), уверенность прогноза — ${forecast.confidence}.`;
};

export const composeRiskExplanation = (
  risk: RiskLevel,
  forecast: CashGapForecast,
  scenario: DemoScenario,
): string => {
  const { greenFromDays, yellowFromDays } = scenario.riskThresholds;
  if (risk === 'green') {
    return `Запаса хватает более чем на ${greenFromDays} дней, поэтому статус зеленый — поводов для вмешательства нет`;
  }
  if (risk === 'yellow') {
    return `До прогнозируемого разрыва ${forecast.daysUntilGap ?? 0} дней — это в коридоре ${yellowFromDays}–${greenFromDays} дней, поэтому статус желтый: время действовать спокойно, но не откладывая`;
  }
  return `До прогнозируемого разрыва менее ${yellowFromDays} дней, поэтому статус красный — нужна поддержка прямо сейчас`;
};

export const composeRecommendations = (
  diagnostics: Diagnostics,
  forecast: CashGapForecast,
  risk: RiskLevel,
  scenario: DemoScenario,
): Recommendation[] => {
  if (risk === 'green' || forecast.daysUntilGap === null) {
    return [];
  }
  const [installments, tips, tariff] = scenario.products;
  const recommendations: Recommendation[] = [];
  if (installments) {
    recommendations.push({
      productTitle: installments.title,
      action: `Перевести покупку оборудования в рассрочку «${installments.title}» — разовая трата ${Math.round(diagnostics.largeExpenseShare * 100)}% всех расходов растянется на комфортные платежи, и это делается за один день из приложения`,
    });
  }
  if (tips) {
    recommendations.push({
      productTitle: tips.title,
      action: `Включить сервис чаевых «${tips.title}» — при среднем чеке ${diagnostics.averageTicket} ₽ чаевые по QR добавят 5–10% дохода уже с завтрашних клиентов`,
    });
  }
  if (tariff) {
    recommendations.push({
      productTitle: tariff.title,
      action: `Запустить акцию на понедельник и вторник — самые тихие дни недели — и подключить «${tariff.title}», чтобы комиссия не съедала выручку в сезонный спад`,
    });
  }
  return recommendations.slice(0, 3);
};

export const composeProactiveMessage = (
  recommendations: readonly Recommendation[],
  scenario: DemoScenario,
): ProactiveMessage => {
  const { name } = scenario.entrepreneur;
  const primary = recommendations[0];
  if (!primary) {
    return {
      text: `${name}, у вашего бизнеса устойчивый денежный поток — продолжайте в том же духе, а я продолжу следить за цифрами.`,
      ctaLabel: 'Открыть дашборд',
    };
  }
  return {
    text: `${name}, лето в бьюти — всегда тише обычного, и по вашим оплатам я вижу, что через пару недель запас может стать совсем небольшим. Это нормальная сезонная история, и её легко смягчить заранее. Я подготовила план из ${recommendations.length} шагов — начнем с рассрочки на оборудование, это займет пару минут.`,
    ctaLabel: `Подключить «${primary.productTitle}»`,
  };
};
