import type { DemoScenario } from 'shared/config';
import { addDays, createSeededRandom, weekdayIndex } from 'shared/lib';
import type { PaymentChannel, Transaction } from './types';

const daysPerMonth = 28;
const weekdayFactors = [0.9, 0.6, 0.8, 1.0, 1.1, 1.2, 1.4] as const;

const pickChannel = (roll: number): PaymentChannel => {
  if (roll < 0.5) {
    return 'mPOS';
  }
  if (roll < 0.9) {
    return 'QR-СБП';
  }
  return 'AlfaPay';
};

export const generateTransactions = (scenario: DemoScenario): Transaction[] => {
  const random = createSeededRandom(scenario.seed);
  const transactions: Transaction[] = [];

  for (let dayOffset = 0; dayOffset < scenario.totalDays; dayOffset += 1) {
    const date = addDays(scenario.startDate, dayOffset);
    const monthIndex = Math.min(3, Math.floor(dayOffset / daysPerMonth));
    const monthTarget = scenario.monthlyRevenueTargets[monthIndex] ?? 0;
    const weekdayFactor = weekdayFactors[weekdayIndex(date)] ?? 1;
    const revenueTarget = Math.round(
      (monthTarget / daysPerMonth) * weekdayFactor * (0.75 + 0.5 * random()),
    );

    const serviceCount = 1 + Math.floor(random() * 3);
    let remainingRevenue = revenueTarget;
    for (let serviceIndex = 0; serviceIndex < serviceCount; serviceIndex += 1) {
      const isLastService = serviceIndex === serviceCount - 1;
      const amount = isLastService
        ? remainingRevenue
        : Math.round(remainingRevenue * (0.3 + 0.3 * random()));
      remainingRevenue -= amount;
      if (amount > 0) {
        transactions.push({ date, amount, channel: pickChannel(random()), category: 'услуга' });
      }
    }

    if (random() < 0.35 && revenueTarget > 0) {
      const tip = Math.round(revenueTarget * (0.05 + 0.05 * random()));
      if (tip > 0) {
        transactions.push({ date, amount: tip, channel: 'QR-СБП', category: 'чаевые' });
      }
    }

    if (dayOffset % daysPerMonth === 0) {
      transactions.push({
        date,
        amount: -scenario.monthlyRent,
        channel: 'mPOS',
        category: 'расход_аренда',
      });
    }

    if (dayOffset % 7 === 3) {
      const materialsCost = Math.round(scenario.weeklyMaterialsCost * (0.85 + 0.3 * random()));
      transactions.push({
        date,
        amount: -materialsCost,
        channel: 'mPOS',
        category: 'расход_материалы',
      });
    }

    if (dayOffset === scenario.equipmentDayOffset) {
      transactions.push({
        date,
        amount: -scenario.equipmentCost,
        channel: 'mPOS',
        category: 'расход_оборудование',
      });
    }
  }

  return transactions;
};
