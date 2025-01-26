import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BetPlacementsProps {
  betId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BetPlacements = ({ betId, isOpen, onClose }: BetPlacementsProps) => {
  const { data: placements } = useQuery({
    queryKey: ["bet-placements", betId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bet_placements")
        .select("*")
        .eq("bet_id", betId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0B0F] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl mb-4">Placed Bets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {placements?.map((placement) => (
            <div
              key={placement.id}
              className="flex justify-between items-center p-3 rounded-lg bg-gray-800"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Option {placement.option}
                </span>
                <span className="text-sm text-muted-foreground">
                  €{placement.amount.toFixed(2)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(placement.created_at), "HH:mm d.M.")}
              </span>
            </div>
          ))}
          {placements?.length === 0 && (
            <p className="text-center text-muted-foreground">
              No bets placed yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};