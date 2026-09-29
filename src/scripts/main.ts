import { initMenu } from './menu';
import { initThemeToggle } from './theme';

// Each feature is independent: one failing must not stop the others.
for (const init of [initThemeToggle, initMenu]) {
  try {
    init();
  } catch (error) {
    console.error(error);
  }
}
