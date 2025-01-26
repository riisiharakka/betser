import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { BetOptions } from "./bet-card/BetOptions";
import { BetTimer } from "./bet-card/BetTimer";
import { PlaceBetForm } from "./bet-card/PlaceBetForm";
import { Bet } from "@/lib/types";

interface BetCardProps {
  bet: Bet;
  user: User | null;
}

export const BetCard = ({ bet, user }: BetCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);

  const handleTimeEnd = () => {
    setIsEnded(true);
  };

  const handleBetPlaced = () => {
    setSelectedOption(null);
  };

  const isDisabled = !user || isEnded || bet.isResolved;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bet.eventName}</CardTitle>
        <CardDescription>
          {bet.isResolved
            ? `Winner: ${bet.winner === "A" ? bet.optionA : bet.optionB}`
            : "Betting is " + (isEnded ? "closed" : "open")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BetTimer endTime={bet.endTime} onTimeEnd={handleTimeEnd} />
        
        <BetOptions
          optionA={bet.optionA}
          optionB={bet.optionB}
          poolA={bet.poolA}
          poolB={bet.poolB}
          onSelectOption={setSelectedOption}
          selectedOption={selectedOption}
          isDisabled={isDisabled}
        />

        {user && selectedOption && !isDisabled && (
          <PlaceBetForm
            betId={bet.id}
            userId={user.id}
            selectedOption={selectedOption}
            onBetPlaced={handleBetPlaced}
          />
        )}

        {!user && (
          <p className="text-sm text-muted-foreground text-center">
            Please sign in to place a bet
          </p>
        )}
      </CardContent>
    </Card>
  );
};