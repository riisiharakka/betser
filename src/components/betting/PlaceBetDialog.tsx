import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlaceBetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  betAmount: string;
  onBetAmountChange: (amount: string) => void;
  onConfirm: () => void;
  isPlacingBet: boolean;
}

export const PlaceBetDialog = ({
  open,
  onOpenChange,
  betAmount,
  onBetAmountChange,
  onConfirm,
  isPlacingBet,
}: PlaceBetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place Your Bet</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="betAmount" className="text-sm font-medium mb-2 block">
            Bet Amount (€)
          </label>
          <Input
            id="betAmount"
            type="number"
            min="0"
            step="0.01"
            value={betAmount}
            onChange={(e) => onBetAmountChange(e.target.value)}
            placeholder="Enter bet amount"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPlacingBet}>
            {isPlacingBet ? "Placing Bet..." : "Confirm Bet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};