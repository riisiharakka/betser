import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { BetOptions } from "./bet-card/BetOptions";
import { BetPlacements } from "./bet-card/BetPlacements";
import { BetInformation } from "./bet-card/BetInformation";
import { BetStatus } from "./bet-card/BetStatus";
import { MoneyOwedDetails } from "./bet-card/MoneyOwedDetails";
import { DareLosers } from "./bet-card/DareLosers";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bet } from "@/lib/types";

interface BetCardProps {
  bet: Bet;
  user: User | null;
}

export const BetCard = ({ bet, user }: BetCardProps) => {
  const [isEnded, setIsEnded] = useState(false);
  const [showPlacements, setShowPlacements] = useState(false);
  const { toast } = useToast();

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

  const { data: participantCount = 0 } = useQuery({
    queryKey: ["bet-participants", bet.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("bet_placements")
        .select("*", { count: 'exact', head: true })
        .eq("bet_id", bet.id);
      
      return count || 0;
    },
    enabled: bet.type === 'dare',
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
              description: `Maximum bet size for this event is ${maxSize} ${bet.currency}. Please enter a smaller amount.`,
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
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={bet.type === 'wager' ? "default" : "secondary"}>
              {bet.type === 'wager' ? 'Wager' : 'Dare'}
            </Badge>
          </div>
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
            maxBetSize={bet.maxBetSize}
            currency={bet.currency}
            type={bet.type}
            stake={bet.stake}
          />

          <BetInformation
            totalPool={totalPool}
            maxBetSize={bet.maxBetSize}
            currency={bet.currency}
            endTime={bet.endTime}
            onTimeEnd={handleTimeEnd}
            onShowPlacements={() => setShowPlacements(true)}
            type={bet.type}
            participantCount={participantCount}
          />

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

          <BetStatus
            isResolved={bet.isResolved}
            winner={bet.winner}
            optionA={bet.optionA}
            optionB={bet.optionB}
          />

          {bet.type === 'dare' && bet.isResolved && bet.winner && (
            <>
              <Separator className="my-4" />
              <DareLosers betId={bet.id} winner={bet.winner} />
            </>
          )}

          {bet.type !== 'dare' && (
            <MoneyOwedDetails
              eventName={bet.eventName}
              isResolved={bet.isResolved}
              user={user}
              existingBet={existingBet}
              currency={bet.currency}
            />
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

export default BetCard;