import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bet } from "@/lib/types";
import { calculateOdds, formatOdds } from "@/lib/utils/odds";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BetOption } from "./betting/BetOption";
import { PlaceBetDialog } from "./betting/PlaceBetDialog";
import { ViewBetsDialog } from "./betting/ViewBetsDialog";

interface BetCardProps {
  bet: Bet;
  user: User | null;
}

export const BetCard = ({ bet, user }: BetCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [placeBetDialogOpen, setPlaceBetDialogOpen] = useState(false);
  const [viewBetsDialogOpen, setViewBetsDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [betAmount, setBetAmount] = useState("10");
  const { oddsA, oddsB } = calculateOdds(bet.poolA, bet.poolB);
  const totalPool = bet.poolA + bet.poolB;
  const timeLeft = new Date(bet.endTime).getTime() - new Date().getTime();
  const isActive = timeLeft > 0;

  const { data: betPlacements } = useQuery({
    queryKey: ["betPlacements", bet.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bet_placements")
        .select("amount, option, created_at")
        .eq("bet_id", bet.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleBetClick = (option: 'A' | 'B') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place a bet.",
      });
      navigate("/auth");
      return;
    }
    setSelectedOption(option);
    setPlaceBetDialogOpen(true);
  };

  const handlePlaceBet = async () => {
    if (!selectedOption || !user || isPlacingBet) return;

    try {
      setIsPlacingBet(true);
      const amount = parseFloat(betAmount);
      
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid bet amount.",
          variant: "destructive",
        });
        return;
      }

      const { error: err } = await supabase.rpc('place_bet', {
        p_bet_id: bet.id,
        p_user_id: user.id,
        p_option: selectedOption,
        p_amount: amount // Now correctly passing a number
      });

      if (err) throw err;

      toast({
        title: "Bet Placed Successfully",
        description: `You bet €${amount} on ${selectedOption === 'A' ? bet.optionA : bet.optionB}`,
      });
      setPlaceBetDialogOpen(false);
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <>
      <Card 
        className="w-full hover:shadow-lg transition-shadow cursor-pointer" 
        onClick={() => setViewBetsDialogOpen(true)}
      >
        <CardHeader>
          <CardTitle className="text-xl font-bold">{bet.eventName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-2">Bet on</div>
          <div className="grid grid-cols-2 gap-4">
            <BetOption
              option="A"
              optionText={bet.optionA}
              odds={formatOdds(oddsA)}
              onBetClick={handleBetClick}
              disabled={!isActive || isPlacingBet}
            />
            <BetOption
              option="B"
              optionText={bet.optionB}
              odds={formatOdds(oddsB)}
              onBetClick={handleBetClick}
              disabled={!isActive || isPlacingBet}
            />
          </div>
          
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <div>Total Pool: €{totalPool.toFixed(2)}</div>
            <div>
              {isActive
                ? `Ends in ${Math.ceil(timeLeft / (1000 * 60))} minutes`
                : "Betting Closed"}
            </div>
          </div>
        </CardContent>
      </Card>

      <PlaceBetDialog
        open={placeBetDialogOpen}
        onOpenChange={setPlaceBetDialogOpen}
        betAmount={betAmount}
        onBetAmountChange={setBetAmount}
        onConfirm={handlePlaceBet}
        isPlacingBet={isPlacingBet}
      />

      <ViewBetsDialog
        open={viewBetsDialogOpen}
        onOpenChange={setViewBetsDialogOpen}
        eventName={bet.eventName}
        betPlacements={betPlacements}
        optionA={bet.optionA}
        optionB={bet.optionB}
      />
    </>
  );
};