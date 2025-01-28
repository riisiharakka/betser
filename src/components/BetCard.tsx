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
import { BetPlacements } from "./bet-card/BetPlacements";
import { Info, DollarSign, User as UserIcon } from "lucide-react";
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

  const { data: moneyOwed } = useQuery({
    queryKey: ["money-owed", bet.id, user?.id],
    queryFn: async () => {
      if (!user || !bet.isResolved) return null;
      
      const { data } = await supabase
        .from("money_owed")
        .select("*")
        .eq("event_name", bet.eventName)
        .or(`winner_id.eq.${user.id},debtor_id.eq.${user.id}`)
        .maybeSingle();
      
      console.log("Money owed data for event:", bet.eventName, data);
      return data;
    },
    enabled: !!user && bet.isResolved,
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

  const renderMoneyOwedDetails = () => {
    if (!moneyOwed || !user) return null;

    console.log("Rendering money owed details:", moneyOwed);

    const isDebtor = moneyOwed.debtor_id === user.id;
    const otherParty = isDebtor ? moneyOwed.winner_username : moneyOwed.debtor_username;
    const amount = moneyOwed.profit;
    
    if (!otherParty || amount === null || amount === undefined) return null;

    return (
      <div className="space-y-4 border-t border-gray-800 pt-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isDebtor 
                ? `You owe ${otherParty}`
                : `${otherParty} owes you`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className={`text-sm font-medium ${
              isDebtor ? 'text-red-500' : 'text-green-500'
            }`}>
              €{Math.abs(amount).toFixed(2)}
            </span>
          </div>
        </div>
        {moneyOwed.bet_amount && (
          <div className="text-sm text-muted-foreground">
            Original bet: €{moneyOwed.bet_amount.toFixed(2)}
          </div>
        )}
      </div>
    );
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
            maxBetSize={bet.maxBetSize}
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
            <>
              <p className="text-lg text-muted-foreground text-center">
                Winner: {bet.winner === "A" ? bet.optionA : bet.optionB}
              </p>
              {renderMoneyOwedDetails()}
            </>
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