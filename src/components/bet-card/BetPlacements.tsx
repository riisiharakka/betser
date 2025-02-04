import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Archive, Check, X, User } from "lucide-react";

interface BetPlacementsProps {
  betId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface BetPlacement {
  id: string;
  bet_id: string;
  user_id: string;
  option: string;
  amount: number;
  created_at: string;
  is_paid: boolean;
  bets: {
    option_a: string;
    option_b: string;
    end_time: string;
    is_resolved: boolean;
    winner: string | null;
    currency: string;
    type: 'wager' | 'dare';
  };
  username: string | null;
}

export const BetPlacements = ({ betId, isOpen, onClose }: BetPlacementsProps) => {
  const { data: placements = [] } = useQuery<BetPlacement[]>({
    queryKey: ["bet-placements", betId],
    queryFn: async () => {
      const { data: betPlacements, error: placementsError } = await supabase
        .from("bet_placements")
        .select(`
          *,
          bets (
            option_a,
            option_b,
            end_time,
            is_resolved,
            winner,
            currency,
            type
          )
        `)
        .eq("bet_id", betId)
        .order("created_at", { ascending: true });

      if (placementsError) throw placementsError;
      if (!betPlacements) return [];

      const userIds = betPlacements.map(placement => placement.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      return betPlacements.map(placement => ({
        ...placement,
        username: profiles?.find(p => p.id === placement.user_id)?.username ?? null
      }));
    },
    enabled: isOpen,
  });

  const getBetStatus = (placement: BetPlacement) => {
    const timeLeft = new Date(placement.bets.end_time).getTime() - new Date().getTime();
    const isActive = timeLeft > 0;

    if (!placement.bets.is_resolved && isActive) {
      return {
        label: "Open",
        color: "text-blue-500",
        Icon: Clock
      };
    } else if (!placement.bets.is_resolved && !isActive) {
      return {
        label: "Closed",
        color: "text-gray-500",
        Icon: Archive
      };
    } else if (placement.bets.winner === placement.option) {
      return {
        label: "Won",
        color: "text-green-500",
        Icon: Check
      };
    } else {
      return {
        label: "Lost",
        color: "text-red-500",
        Icon: X
      };
    }
  };

  const isDare = placements[0]?.bets?.type === 'dare';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0B0F] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl mb-4">Placed Bets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {placements.map((placement) => {
            const status = getBetStatus(placement);
            return (
              <div
                key={placement.id}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {placement.username || 'Anonymous'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {placement.option === 'A' ? placement.bets.option_a : placement.bets.option_b}
                  </span>
                  {!isDare && (
                    <span className="text-sm text-muted-foreground">
                      {placement.amount.toFixed(2)} {placement.bets.currency}
                    </span>
                  )}
                  <div className={`flex items-center gap-1 ${status.color}`}>
                    <status.Icon className="h-4 w-4" />
                    <span className="text-sm">{status.label}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(placement.created_at), "HH:mm d.M.")}
                </span>
              </div>
            );
          })}
          {placements.length === 0 && (
            <p className="text-center text-muted-foreground">
              No bets placed yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};