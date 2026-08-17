import { useEffect, useState } from 'react';

export interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

const EMPTY_COUNTDOWN: CountdownValues = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isComplete: true,
};

function calculateCountdown(targetDate: Date): CountdownValues {
  const diff = targetDate.getTime() - Date.now();

  if (diff <= 0) {
    return EMPTY_COUNTDOWN;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isComplete: false };
}

export function useCountdown(targetDate: Date): CountdownValues {
  const [countdown, setCountdown] = useState<CountdownValues>(() =>
    calculateCountdown(targetDate),
  );

  useEffect(() => {
    const tick = () => setCountdown(calculateCountdown(targetDate));
    tick();

    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [targetDate]);

  return countdown;
}

export function padTimeUnit(value: number): string {
  return String(value).padStart(2, '0');
}
