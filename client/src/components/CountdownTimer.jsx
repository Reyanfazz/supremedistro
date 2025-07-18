import React, { useEffect, useState } from 'react';

// Move outside component so it's stable and doesn't cause lint issues
const calculateTimeLeft = (expiryDate) => {
  const difference = new Date(expiryDate) - new Date();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const CountdownTimer = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(expiryDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiryDate);
      setTimeLeft(newTimeLeft);
      if (!newTimeLeft) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft) return <span className="text-red-600 font-semibold">Deal Expired</span>;

  return (
    <span className="font-mono text-green-700 font-semibold">
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours.toString().padStart(2, '0')}h :
      {timeLeft.minutes.toString().padStart(2, '0')}m :
      {timeLeft.seconds.toString().padStart(2, '0')}s
    </span>
  );
};

export default CountdownTimer;
