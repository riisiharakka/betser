import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { format } from "date-fns";

interface BetPlacement {
  amount: number;
  option: string;
  created_at: string;
}

interface ViewBetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  betPlacements: BetPlacement[] | undefined;
  optionA: string;
  optionB: string;
}

export const ViewBetsDialog = ({
  open,
  onOpenChange,
  eventName,
  betPlacements,
  optionA,
  optionB,
}: ViewBetsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Placed Bets - {eventName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {betPlacements?.map((placement, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg"
              >
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {placement.option === 'A' ? (
                      <>
                        <Check className="w-4 h-4" />
                        {optionA}
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        {optionB}
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(placement.created_at), "HH:mm d.M")}
                  </div>
                </div>
                <div className="font-semibold">
                  €{placement.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {(!betPlacements || betPlacements.length === 0) && (
              <div className="text-center text-muted-foreground">
                No bets placed yet
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};