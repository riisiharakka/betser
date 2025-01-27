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
  eventName,
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
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    if (maxBetSize && numericAmount > maxBetSize) {
      return;
    }

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
          variant={selectedBetOption === "A" ? "default" : "outline"}
          className={cn(
            "h-auto py-8 space-y-2",
            selectedOption === "A" && "border-green-500"
          )}
          onClick={() => handleOptionSelect("A")}
          disabled={isDisabled}
        >
          <div className="text-lg font-semibold">{optionA}</div>
          <div className="text-sm text-muted-foreground">
            Pool: €{poolA.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            Odds: {getOdds(poolA)}
          </div>
        </Button>

        <Button
          type="button"
          variant={selectedBetOption === "B" ? "default" : "outline"}
          className={cn(
            "h-auto py-8 space-y-2",
            selectedOption === "B" && "border-green-500"
          )}
          onClick={() => handleOptionSelect("B")}
          disabled={isDisabled}
        >
          <div className="text-lg font-semibold">{optionB}</div>
          <div className="text-sm text-muted-foreground">
            Pool: €{poolB.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            Odds: {getOdds(poolB)}
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
            className="flex-1"
            min={0}
            max={maxBetSize || undefined}
            step={0.01}
          />
          <Button type="submit">Place Bet</Button>
        </div>
      )}
    </form>
  );
};