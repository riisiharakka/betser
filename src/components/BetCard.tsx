import { Card } from "@/components/ui/card";
import { BetOptions } from "@/components/bet-card/BetOptions";
import { BetTimer } from "@/components/bet-card/BetTimer";
import { PlaceBetForm } from "@/components/bet-card/PlaceBetForm";
import type { Bet } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";

interface BetCardProps {
  bet: Bet;
  user: User | null;
  onPlaceBet: (betId: string, option: string, amount: number) => Promise<void>;
}

export const BetCard = ({ bet, user, onPlaceBet }: BetCardProps) => {
  const handleTimeEnd = () => {
    // Handle time end if needed
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold mb-2">{bet.event_name}</h3>
        </div>

        <BetOptions
          optionA={bet.option_a}
          optionB={bet.option_b}
          poolA={bet.pool_a}
          poolB={bet.pool_b}
          onSelectOption={() => {}}
          selectedOption={null}
          isDisabled={bet.is_resolved}
        />

        <div className="text-center text-muted-foreground">
          <BetTimer endTime={bet.end_time} onTimeEnd={handleTimeEnd} />
        </div>

        {!bet.is_resolved && user && (
          <PlaceBetForm
            betId={bet.id}
            userId={user.id}
            selectedOption=""
            onBetPlaced={() => {}}
          />
        )}

        {bet.is_resolved && bet.winner && (
          <div className="text-center font-medium">
            Winner: {bet.winner === "A" ? bet.option_a : bet.option_b}
          </div>
        )}
      </div>
    </Card>
  );
};