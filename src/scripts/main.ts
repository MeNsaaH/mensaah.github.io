import { initPalette } from './command-palette';
import { initMenu } from './menu';
import { initRobot } from './robot-eyes';
import { initThemeToggle } from './theme';
import { initUptime } from './uptime-ticker';

// Each feature is independent: one failing must not stop the others.
for (const init of [initThemeToggle, initMenu, initUptime, initRobot, initPalette]) {
  try {
    init();
  } catch (error) {
    console.error(error);
  }
}
