import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bet } from "@/lib/types";
import { calculateOdds, formatOdds } from "@/lib/utils/odds";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface BetCardProps {
  bet: Bet;
  user: User | null;
}

export const BetCard = ({ bet, user }: BetCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [betAmount, setBetAmount] = useState("10");
  const { oddsA, oddsB } = calculateOdds(bet.poolA, bet.poolB);
  const totalPool = bet.poolA + bet.poolB;
  const timeLeft = new Date(bet.endTime).getTime() - new Date().getTime();
  const isActive = timeLeft > 0;

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
    setDialogOpen(true);
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

      const { error } = await supabase
        .from('bet_placements')
        .insert({
          bet_id: bet.id,
          user_id: user.id,
          option: selectedOption,
          amount: amount
        });

      if (error) throw error;

      toast({
        title: "Bet Placed Successfully",
        description: `You bet $${amount} on ${selectedOption === 'A' ? bet.optionA : bet.optionB}`,
      });
      setDialogOpen(false);
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
      <Card className="w-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{bet.eventName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-2">Bet on</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="font-semibold mb-2">{bet.optionA}</div>
              <div className="text-2xl font-bold text-primary">
                {formatOdds(oddsA)}x
              </div>
              <Button
                className="mt-2 w-full"
                onClick={() => handleBetClick('A')}
                disabled={!isActive || isPlacingBet}
              >
                {bet.optionA}
              </Button>
            </div>
            
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="font-semibold mb-2">{bet.optionB}</div>
              <div className="text-2xl font-bold text-primary">
                {formatOdds(oddsB)}x
              </div>
              <Button
                className="mt-2 w-full"
                onClick={() => handleBetClick('B')}
                disabled={!isActive || isPlacingBet}
              >
                {bet.optionB}
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <div>Total Pool: ${totalPool.toFixed(2)}</div>
            <div>
              {isActive
                ? `Ends in ${Math.ceil(timeLeft / (1000 * 60))} minutes`
                : "Betting Closed"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="betAmount" className="text-sm font-medium mb-2 block">
              Bet Amount ($)
            </label>
            <Input
              id="betAmount"
              type="number"
              min="0"
              step="0.01"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter bet amount"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceBet} disabled={isPlacingBet}>
              {isPlacingBet ? "Placing Bet..." : "Confirm Bet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};