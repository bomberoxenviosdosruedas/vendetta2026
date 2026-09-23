"use client";

import { useState, useEffect } from 'react';

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = now.getFullYear();
      const h = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${d}-${m}-${y} ${h}:${min}:${s}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentTime) {
    return <span className="text-[#fff400] font-bold font-['Space_Mono']">--:--:--</span>;
  }

  return (
    <span className="text-[#fff400] font-bold font-['Space_Mono'] tabular-nums">
      {currentTime}
    </span>
  );
}
