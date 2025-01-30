import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
  currency: string;
  type?: string;
  stake?: string | null;
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
  currency,
  type,
  stake,
}: BetOptionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBetOption, setSelectedBetOption] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalPool = poolA + poolB;
  
  const getOdds = (pool: number) => {
    if (pool === 0) return 2;
    return Number((totalPool / pool).toFixed(2));
  };

  const handleBetClick = (option: string) => {
    setSelectedBetOption(option);
    setIsDialogOpen(true);
    setError(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    if (error) setError(null);
    
    if (value && maxBetSize && Number(value) > maxBetSize) {
      setError(`Maximum bet size is ${maxBetSize} ${currency}`);
    }
  };

  const handleConfirmBet = () => {
    if (!selectedBetOption) return;

    const isDare = type === 'dare';
    
    if (isDare) {
      // For dares, we don't need an amount
      onSelectOption(selectedBetOption, 0);
      setIsDialogOpen(false);
      setSelectedBetOption(null);
      return;
    }

    // For wagers, validate amount
    if (!amount) return;
    
    const betAmount = Number(amount);
    if (maxBetSize && betAmount > maxBetSize) {
      setError(`Maximum bet size is ${maxBetSize} ${currency}`);
      return;
    }
    
    onSelectOption(selectedBetOption, betAmount);
    setIsDialogOpen(false);
    setAmount("");
    setSelectedBetOption(null);
    setError(null);
  };

  const isDare = type === 'dare';

  return (
    <>
      <div className="space-y-6">
        <div className="text-2xl font-medium text-center">
          Bet on {stake && isDare ? stake : ''}
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            {!isDare && <span className="text-xl block text-center">{optionA}</span>}
            <Button
              onClick={() => handleBetClick("A")}
              variant={selectedOption === "A" ? "default" : "outline"}
              disabled={isDisabled}
              className="w-full py-6 text-lg"
            >
              {isDare ? optionA : `${getOdds(poolA)}x`}
            </Button>
          </div>

          <div className="space-y-4">
            {!isDare && <span className="text-xl block text-center">{optionB}</span>}
            <Button
              onClick={() => handleBetClick("B")}
              variant={selectedOption === "B" ? "default" : "outline"}
              disabled={isDisabled}
              className="w-full py-6 text-lg"
            >
              {isDare ? optionB : `${getOdds(poolB)}x`}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0A0B0F] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl">Place Your Bet</DialogTitle>
            <DialogDescription>
              {isDare ? "Join this dare by selecting your option" : "Place your bet on this event"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p className="text-muted-foreground mb-6">
              {isDare ? "Join" : "Place your bet on"}{" "}
              <span className="font-bold">{eventName}</span> for option{" "}
              <span className="font-bold">
                {selectedBetOption === "A" ? optionA : optionB}
              </span>
            </p>
            {!isDare && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-lg">
                    Bet Amount ({currency})
                  </label>
                  {maxBetSize && (
                    <div className="text-sm text-muted-foreground">
                      Max: {maxBetSize} {currency}
                    </div>
                  )}
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="bg-background"
                  min="0"
                  step="0.01"
                  max={maxBetSize || undefined}
                />
                {error && (
                  <p className="text-sm text-destructive mt-1">{error}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setError(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBet}
              disabled={!isDare && (!amount || Number(amount) <= 0 || !!error)}
              className="flex-1"
            >
              Confirm Bet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};