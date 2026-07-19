import { addDays } from '../lib/dates';

export interface EntrepreneurProfile {
  readonly name: string;
  readonly age: number;
  readonly niche: string;
  readonly city: string;
}

export interface PaymentProduct {
  readonly id: string;
  readonly title: string;
  readonly pitch: string;
}

export interface RiskThresholds {
  readonly greenFromDays: number;
  readonly yellowFromDays: number;
}

export interface DemoScenario {
  readonly seed: number;
  readonly startDate: string;
  readonly todayDate: string;
  readonly totalDays: number;
  readonly openingBalance: number;
  readonly monthlyRevenueTargets: readonly [number, number, number, number];
  readonly monthlyRent: number;
  readonly weeklyMaterialsCost: number;
  readonly equipmentCost: number;
  readonly equipmentDayOffset: number;
  readonly riskThresholds: RiskThresholds;
  readonly entrepreneur: EntrepreneurProfile;
  readonly products: readonly PaymentProduct[];
}

const scenarioStartDate = '2026-03-29';
const scenarioTotalDays = 112;

export const marinaScenario: DemoScenario = {
  seed: 20260329,
  startDate: scenarioStartDate,
  todayDate: addDays(scenarioStartDate, scenarioTotalDays - 1),
  totalDays: scenarioTotalDays,
  openingBalance: 10_000,
  monthlyRevenueTargets: [55_000, 72_000, 42_000, 23_000],
  monthlyRent: 25_000,
  weeklyMaterialsCost: 3_000,
  equipmentCost: 48_000,
  equipmentDayOffset: 63,
  riskThresholds: { greenFromDays: 30, yellowFromDays: 14 },
  entrepreneur: { name: 'Марина', age: 22, niche: 'бьюти', city: 'Казань' },
  products: [
    {
      id: 'podeli',
      title: 'Подели',
      pitch: 'BNPL-рассрочка на оборудование вместо разовой траты',
    },
    {
      id: 'net-monet',
      title: 'Нет монет',
      pitch: 'чаевые по QR — дополнительный доход с каждого клиента',
    },
    {
      id: 'flex-acquiring',
      title: 'Гибкий тариф эквайринга',
      pitch: 'сниженная комиссия в месяцы сезонного спада',
    },
  ],
};
