import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BetOptionProps {
  option: 'A' | 'B';
  optionText: string;
  odds: number;
  onBetClick: (option: 'A' | 'B') => void;
  disabled: boolean;
}

export const BetOption = ({ option, optionText, odds, onBetClick, disabled }: BetOptionProps) => {
  const Icon = option === 'A' ? Check : X;

  return (
    <div className="text-center p-4 bg-secondary/10 rounded-lg">
      <div className="font-semibold mb-2 flex items-center justify-center gap-2">
        <Icon className="w-5 h-5" />
        {optionText}
      </div>
      <div className="text-2xl font-bold text-primary">
        {odds}x
      </div>
      <Button
        className="mt-2 w-full"
        onClick={(e) => {
          e.stopPropagation();
          onBetClick(option);
        }}
        disabled={disabled}
      >
        {optionText}
      </Button>
    </div>
  );
};