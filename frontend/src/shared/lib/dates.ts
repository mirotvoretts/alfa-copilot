const dayInMs = 86_400_000;

export const addDays = (isoDate: string, days: number): string => {
  const shifted = new Date(Date.parse(isoDate) + days * dayInMs);
  const paddedMonth = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const paddedDay = String(shifted.getUTCDate()).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${paddedMonth}-${paddedDay}`;
};

export const daysBetween = (fromIsoDate: string, toIsoDate: string): number =>
  Math.round((Date.parse(toIsoDate) - Date.parse(fromIsoDate)) / dayInMs);

export const weekdayIndex = (isoDate: string): number => new Date(Date.parse(isoDate)).getUTCDay();
