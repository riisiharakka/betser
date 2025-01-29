import { Bet } from "@/lib/types";
import { BetCard } from "./BetCard";
import type { User } from "@supabase/supabase-js";
import { useBets } from "@/hooks/useBets";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface BetListProps {
  user: User | null;
}

export const BetList = ({ user }: BetListProps) => {
  const queryClient = useQueryClient();
  const { data: bets, isLoading, error } = useBets();

  useEffect(() => {
    // Subscribe to real-time updates for both bets and bet_placements
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bets",
        },
        () => {
          // Invalidate and refetch bets when there's a change
          queryClient.invalidateQueries({ queryKey: ["bets"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bet_placements",
        },
        () => {
          // Also invalidate when bet placements change
          queryClient.invalidateQueries({ queryKey: ["bets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 bg-secondary/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        Error loading bets. Please try again later.
      </div>
    );
  }

  if (!bets?.length) {
    return (
      <div className="text-center text-muted-foreground">
        No bets available at the moment.
      </div>
    );
  }

  // Filter out hidden bets from the main page
  const visibleBets = bets.filter(bet => !bet.isHidden);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [&>*]:w-full">
      {visibleBets.map((bet) => (
        <div key={bet.id} className="w-full">
          <BetCard
            bet={{
              id: bet.id,
              eventName: bet.eventName,
              optionA: bet.optionA,
              optionB: bet.optionB,
              poolA: bet.poolA,
              poolB: bet.poolB,
              endTime: bet.endTime,
              isResolved: bet.isResolved,
              winner: bet.winner,
              createdBy: bet.createdBy,
              maxBetSize: bet.maxBetSize,
              isHidden: bet.isHidden
            }}
            user={user}
          />
        </div>
      ))}
    </div>
  );
};