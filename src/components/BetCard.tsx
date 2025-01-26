import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { BetOptions } from "./bet-card/BetOptions";
import { BetTimer } from "./bet-card/BetTimer";
import { PlaceBetForm } from "./bet-card/PlaceBetForm";
import { BetPlacements } from "./bet-card/BetPlacements";
import { Info } from "lucide-react";
import { Bet } from "@/lib/types";

interface BetCardProps {
  bet: Bet;
  user: User | null;
}

export const BetCard = ({ bet, user }: BetCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [showPlacements, setShowPlacements] = useState(false);

  const handleTimeEnd = () => {
    setIsEnded(true);
  };

  const handleBetPlaced = () => {
    setSelectedOption(null);
  };

  const isDisabled = !user || isEnded || bet.isResolved;

  return (
    <>
      <Card className="max-w-2xl mx-auto bg-[#0A0B0F] border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl">{bet.eventName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <BetOptions
            optionA={bet.optionA}
            optionB={bet.optionB}
            poolA={bet.poolA}
            poolB={bet.poolB}
            onSelectOption={setSelectedOption}
            selectedOption={selectedOption}
            isDisabled={isDisabled}
          />

          <div className="space-y-2">
            <div 
              className="text-lg text-muted-foreground text-center flex items-center justify-center gap-2 cursor-pointer hover:text-white transition-colors"
              onClick={() => setShowPlacements(true)}
            >
              Total Pool: €{(bet.poolA + bet.poolB).toFixed(2)}
              <Info className="h-4 w-4" />
            </div>
            <BetTimer endTime={bet.endTime} onTimeEnd={handleTimeEnd} />
          </div>

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

          {bet.isResolved && (
            <p className="text-sm text-muted-foreground text-center">
              Winner: {bet.winner === "A" ? bet.optionA : bet.optionB}
            </p>
          )}
        </CardContent>
      </Card>

      <BetPlacements
        betId={bet.id}
        isOpen={showPlacements}
        onClose={() => setShowPlacements(false)}
      />
    </>
  );
};