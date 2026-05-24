import React, { useState, useEffect } from 'react';
import './Countdown.css';

export default function Countdown({ targetDate }) {
  const [time, setTime] = useState(calcTime(targetDate));

  function calcTime(target) {
    const diff = new Date(target) - new Date();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, expired: false };
  }

  useEffect(() => {
    const timer = setInterval(() => setTime(calcTime(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (time.expired) {
    return (
      <div className="countdown-bar">
        <span className="countdown-label">🏆 SORTEIO ENCERRADO</span>
      </div>
    );
  }

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="countdown-bar">
      <span className="countdown-label">⏳ SORTEIO EM</span>
      <div className="countdown-units">
        <div className="countdown-unit">
          <span className="countdown-number">{pad(time.d)}</span>
          <span className="countdown-caption">dias</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-number">{pad(time.h)}</span>
          <span className="countdown-caption">horas</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-number">{pad(time.m)}</span>
          <span className="countdown-caption">min</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-unit">
          <span className="countdown-number">{pad(time.s)}</span>
          <span className="countdown-caption">seg</span>
        </div>
      </div>
    </div>
  );
}
