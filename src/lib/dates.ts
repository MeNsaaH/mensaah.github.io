const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** '2022-07' becomes 'July 2022'. */
export function formatMonth(yearMonth: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  if (!match || !month) throw new Error(`Expected YYYY-MM, got "${yearMonth}"`);
  return `${month} ${match[1]}`;
}

/** A Date becomes '21 Sep 2026', in UTC so build machines agree. */
export function formatDay(date: Date): string {
  const month = MONTHS[date.getUTCMonth()]!.slice(0, 3);
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}
