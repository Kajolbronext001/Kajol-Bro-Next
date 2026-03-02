import { useState, useEffect } from 'react';
import { TOTP } from 'otpauth';

export function useTOTP(secretBase32: string | null) {
  const [code, setCode] = useState<string>('------');
  const [timeLeft, setTimeLeft] = useState<number>(30);

  useEffect(() => {
    if (!secretBase32) {
      setCode('------');
      setTimeLeft(30);
      return;
    }

    let totp: TOTP | null = null;
    try {
      totp = new TOTP({
        secret: secretBase32,
        digits: 6,
        period: 30,
        algorithm: 'SHA1',
      });
    } catch (e) {
      console.error('TOTP Error:', e);
      setCode('INVALID');
      return;
    }

    const update = () => {
      try {
        const currentCode = totp!.generate();
        setCode(currentCode);
        const seconds = Math.floor(Date.now() / 1000);
        setTimeLeft(30 - (seconds % 30));
      } catch (e) {
        console.error('TOTP Generate Error:', e);
        setCode('ERROR');
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [secretBase32]);

  return { code, timeLeft };
}

export function generateRandomText(min: number = 6, max: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
