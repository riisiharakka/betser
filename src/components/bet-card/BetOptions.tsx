import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BetOptionsProps {
  optionA: string;
  optionB: string;
  poolA: number;
  poolB: number;
  onSelectOption: (option: string, amount: number) => void;
  selectedOption: string | null;
  isDisabled: boolean;
  eventName: string;
  maxBetSize?: number | null;
}

export const BetOptions = ({
  optionA,
  optionB,
  poolA,
  poolB,
  onSelectOption,
  selectedOption,
  isDisabled,
  maxBetSize,
}: BetOptionsProps) => {
  const [selectedBetOption, setSelectedBetOption] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const handleOptionSelect = (option: string) => {
    if (isDisabled) return;
    setSelectedBetOption(option);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBetOption || !amount || isDisabled) return;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    if (maxBetSize && numericAmount > maxBetSize) return;

    onSelectOption(selectedBetOption, numericAmount);
    setAmount("");
    setSelectedBetOption(null);
  };

  const totalPool = poolA + poolB;
  const getOdds = (pool: number) => {
    if (totalPool === 0) return "∞";
    return (totalPool / pool).toFixed(2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-32 relative border border-gray-800 bg-[#0A0B0F] hover:bg-gray-900",
            selectedBetOption === "A" && "ring-2 ring-primary",
            selectedOption === "A" && "border-green-500"
          )}
          onClick={() => handleOptionSelect("A")}
          disabled={isDisabled}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-xl font-semibold text-white">{optionA}</div>
            <div className="text-sm text-gray-400">
              Pool: €{poolA.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">
              Odds: {getOdds(poolA)}
            </div>
          </div>
        </Button>

        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-32 relative border border-gray-800 bg-[#0A0B0F] hover:bg-gray-900",
            selectedBetOption === "B" && "ring-2 ring-primary",
            selectedOption === "B" && "border-green-500"
          )}
          onClick={() => handleOptionSelect("B")}
          disabled={isDisabled}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-xl font-semibold text-white">{optionB}</div>
            <div className="text-sm text-gray-400">
              Pool: €{poolB.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">
              Odds: {getOdds(poolB)}
            </div>
          </div>
        </Button>
      </div>

      {selectedBetOption && !isDisabled && (
        <div className="flex gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter amount${maxBetSize ? ` (max €${maxBetSize})` : ''}`}
            className="flex-1 bg-transparent border-gray-800"
            min={0}
            max={maxBetSize || undefined}
            step={0.01}
          />
          <Button 
            type="submit"
            className="bg-primary hover:bg-primary/90"
          >
            Place Bet
          </Button>
        </div>
      )}
    </form>
  );
};