import { useEffect, useState } from 'react';

const THEME_COLOR_DARK = '#1a2a33';
const THEME_COLOR_LIGHT = '#FCF8D8';

function syncThemeColorMeta(isLight: boolean) {
  // Replace any media-scoped theme-color metas with a single resolved one so
  // mobile chrome/Safari pick up the active palette instead of the OS hint.
  const head = document.head;
  const existing = head.querySelectorAll('meta[name="theme-color"]');
  existing.forEach((node) => node.parentElement?.removeChild(node));
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'theme-color');
  meta.setAttribute('content', isLight ? THEME_COLOR_LIGHT : THEME_COLOR_DARK);
  head.appendChild(meta);
}

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLight(true);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches && !savedTheme) {
      setIsLight(true);
    }
  }, []);

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
    syncThemeColorMeta(isLight);
  }, [isLight]);

  return (
    <div className="theme-switch-wrapper">
      <label className="theme-switch" htmlFor="checkbox">
        <input
          type="checkbox"
          id="checkbox"
          checked={isLight}
          onChange={(e) => setIsLight(e.target.checked)}
        />
        <div className="slider-wrapper">
          <div className="rays"></div>
          <div className="slider-knob"></div>
          <div className="stars"></div>
        </div>
      </label>
    </div>
  );
}
