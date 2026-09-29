export interface Duration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ZERO: Duration = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

/** Adds calendar months in UTC, clamping to the last day of the target month. */
function addMonths(date: Date, count: number): Date {
  const target = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + count,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    ),
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

export function durationBetween(start: Date, end: Date): Duration {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { ...ZERO };
  if (end.getTime() <= start.getTime()) return { ...ZERO };

  let totalMonths =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth());
  if (addMonths(start, totalMonths).getTime() > end.getTime()) totalMonths -= 1;

  const anchor = addMonths(start, totalMonths);
  let rest = Math.floor((end.getTime() - anchor.getTime()) / 1000);
  const days = Math.floor(rest / 86400);
  rest -= days * 86400;
  const hours = Math.floor(rest / 3600);
  rest -= hours * 3600;
  const minutes = Math.floor(rest / 60);
  const seconds = rest - minutes * 60;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function formatDuration(d: Duration): string {
  return `${d.years}y ${d.months}m ${d.days}d`;
}

export function formatClock(d: Duration): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.hours)}:${pad(d.minutes)}:${pad(d.seconds)}`;
}
