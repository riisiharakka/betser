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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface BetCardProps {
  bet: Bet;
  user: User | null;
}

export const BetCard = ({ bet, user }: BetCardProps) => {
  const [isEnded, setIsEnded] = useState(false);
  const [showPlacements, setShowPlacements] = useState(false);
  const { toast } = useToast();

  // Query to check if user has already placed a bet
  const { data: existingBet } = useQuery({
    queryKey: ["user-bet", bet.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .from("bet_placements")
        .select("*")
        .eq("bet_id", bet.id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      return data;
    },
    enabled: !!user,
  });

  const handleTimeEnd = () => {
    setIsEnded(true);
  };

  const handlePlaceBet = async (option: string, amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc("place_bet", {
        p_bet_id: bet.id,
        p_user_id: user.id,
        p_option: option,
        p_amount: amount,
      });

      if (error) {
        try {
          const errorBody = JSON.parse(error.message.includes('{') ? 
            error.message.substring(error.message.indexOf('{')) : 
            '{"message": "An unexpected error occurred"}');
          
          if (errorBody.message.includes('maximum allowed size')) {
            const maxSize = errorBody.message.match(/\d+/)[0];
            toast({
              title: "Bet Size Limit Exceeded",
              description: `Maximum bet size for this event is €${maxSize}. Please enter a smaller amount.`,
              variant: "destructive",
            });
            return;
          }
          
          toast({
            title: "Error",
            description: errorBody.message,
            variant: "destructive",
          });
          return;
        } catch (parseError) {
          console.error("Error parsing error details:", parseError);
          toast({
            title: "Error",
            description: "An unexpected error occurred while placing your bet.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "Your bet has been placed successfully",
      });
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isDisabled = !user || isEnded || bet.isResolved || !!existingBet;
  const totalPool = Number((bet.poolA + bet.poolB).toFixed(2));

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
            onSelectOption={handlePlaceBet}
            selectedOption={existingBet?.option || null}
            isDisabled={isDisabled}
            eventName={bet.eventName}
          />

          <div className="space-y-2">
            <div 
              className="text-lg text-muted-foreground text-center flex items-center justify-center gap-2 cursor-pointer hover:text-white transition-colors"
              onClick={() => setShowPlacements(true)}
            >
              Total Pool: €{totalPool}
              <Info className="h-4 w-4" />
            </div>
            {bet.maxBetSize && (
              <div className="text-lg text-muted-foreground text-center">
                Maximum Bet: €{bet.maxBetSize}
              </div>
            )}
            <BetTimer endTime={bet.endTime} onTimeEnd={handleTimeEnd} />
          </div>

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please sign in to place a bet
            </p>
          )}

          {existingBet && (
            <p className="text-sm text-muted-foreground text-center">
              You have already placed a bet on this event
            </p>
          )}

          {bet.isResolved && (
            <p className="text-lg text-muted-foreground text-center">
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