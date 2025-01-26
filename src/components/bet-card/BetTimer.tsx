import { useEffect, useState } from "react";

interface BetTimerProps {
  endTime: Date;
  onTimeEnd: () => void;
}

export const BetTimer = ({ endTime, onTimeEnd }: BetTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        onTimeEnd();
        return "Ended";
      }

      const minutes = Math.floor(difference / (1000 * 60));
      return `${minutes} minutes`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endTime, onTimeEnd]);

  return (
    <div className="text-lg text-muted-foreground text-center">
      Ends in {timeLeft}
    </div>
  );
};