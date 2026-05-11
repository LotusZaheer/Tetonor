import { useEffect, useState } from 'react';

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
