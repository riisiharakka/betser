import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
}: BetOptionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBetOption, setSelectedBetOption] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const totalPool = poolA + poolB;
  
  const getOdds = (pool: number) => {
    // If the pool is 0, return 2 as the default odds
    if (pool === 0) return 2;
    
    // Calculate odds as (Total Pool) / (Option Pool)
    return Number((totalPool / pool).toFixed(2));
  };

  const handleBetClick = (option: string) => {
    setSelectedBetOption(option);
    setIsDialogOpen(true);
  };

  const handleConfirmBet = () => {
    if (selectedBetOption && amount) {
      onSelectOption(selectedBetOption, Number(amount));
      setIsDialogOpen(false);
      setAmount("");
      setSelectedBetOption(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-2xl font-medium text-center">Bet on</div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <span className="text-xl block text-center">{optionA}</span>
            <Button
              onClick={() => handleBetClick("A")}
              variant={selectedOption === "A" ? "default" : "outline"}
              disabled={isDisabled}
              className="w-full py-6 text-lg"
            >
              {getOdds(poolA)}x
            </Button>
          </div>

          <div className="space-y-4">
            <span className="text-xl block text-center">{optionB}</span>
            <Button
              onClick={() => handleBetClick("B")}
              variant={selectedOption === "B" ? "default" : "outline"}
              disabled={isDisabled}
              className="w-full py-6 text-lg"
            >
              {getOdds(poolB)}x
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0A0B0F] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl">Place Your Bet</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-muted-foreground mb-6">
              Place your bet on {eventName} for option{" "}
              {selectedBetOption === "A" ? optionA : optionB}
            </p>
            <div className="space-y-2">
              <label className="text-lg">Bet Amount (€)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBet}
              disabled={!amount || Number(amount) <= 0}
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