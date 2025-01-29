import { Info } from "lucide-react";
import { BetTimer } from "./BetTimer";

interface BetInformationProps {
  totalPool: number;
  maxBetSize: number | null;
  currency: string;
  endTime: Date;
  onTimeEnd: () => void;
  onShowPlacements: () => void;
}

export const BetInformation = ({
  totalPool,
  maxBetSize,
  currency,
  endTime,
  onTimeEnd,
  onShowPlacements,
}: BetInformationProps) => {
  return (
    <div className="space-y-2">
      <div 
        className="text-lg text-muted-foreground text-center flex items-center justify-center gap-2 cursor-pointer hover:text-white transition-colors"
        onClick={onShowPlacements}
      >
        Total Pool: {totalPool} {currency}
        <Info className="h-4 w-4" />
      </div>
      {maxBetSize && (
        <div className="text-lg text-muted-foreground text-center">
          Maximum Bet: {maxBetSize} {currency}
        </div>
      )}
      <BetTimer endTime={endTime} onTimeEnd={onTimeEnd} />
    </div>
  );
};