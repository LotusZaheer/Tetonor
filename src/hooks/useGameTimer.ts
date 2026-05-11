import { useEffect, useRef, useState } from 'react';

export interface GameTimer {
  elapsedMs: number;
  isRunning: boolean;
  startedAt: number | null;
}

/**
 * Runs while `running` is true, resets every time `puzzleKey` changes.
 * Tick cadence is 250ms so the displayed mm:ss stays responsive without
 * forcing a full React re-render every frame.
 */
export function useGameTimer(puzzleKey: unknown, running: boolean): GameTimer {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = running ? performance.now() : null;
    setElapsedMs(0);
  }, [puzzleKey, running]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (startRef.current === null) startRef.current = performance.now();
    intervalRef.current = window.setInterval(() => {
      if (startRef.current !== null) {
        setElapsedMs(Math.floor(performance.now() - startRef.current));
      }
    }, 250);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, puzzleKey]);

  return {
    elapsedMs,
    isRunning: running,
    startedAt: startRef.current,
  };
}
