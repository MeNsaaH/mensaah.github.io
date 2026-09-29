import { durationBetween, formatClock, formatDuration } from '../lib/uptime';

/** Keeps the build-time uptime value current. If anything is missing, the built value stays. */
export function initUptime(): void {
  const root = document.querySelector<HTMLElement>('[data-uptime]');
  const days = root?.querySelector<HTMLElement>('[data-uptime-days]');
  const clock = root?.querySelector<HTMLElement>('[data-uptime-clock]');
  if (!root || !days || !clock) return;

  const start = new Date(root.dataset.start ?? '');
  if (Number.isNaN(start.getTime())) return;

  const tick = () => {
    const duration = durationBetween(start, new Date());
    days.textContent = formatDuration(duration);
    clock.textContent = formatClock(duration);
  };

  tick();
  window.setInterval(tick, 1000);
}
