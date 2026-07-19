const rubleFormatter = new Intl.NumberFormat('ru-RU');

export const formatRubles = (amount: number): string => `${rubleFormatter.format(amount)} ₽`;

export const formatRublesCompact = (amount: number): string =>
  Math.abs(amount) >= 1_000
    ? `${rubleFormatter.format(Math.round(amount / 1_000))} тыс ₽`
    : formatRubles(amount);
