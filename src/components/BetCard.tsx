import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bet } from "@/lib/types";
import { calculateOdds, formatOdds } from "@/lib/utils/odds";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface BetCardProps {
  bet: Bet;
  user: User | null;
}

interface BetPlacement {
  amount: number;
  option: string;
  created_at: string;
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

  // Fetch bet placements
  const { data: betPlacements } = useQuery({
    queryKey: ["betPlacements", bet.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bet_placements")
        .select("amount, option, created_at")
        .eq("bet_id", bet.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as BetPlacement[];
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

      const { data, error: err } = await supabase.rpc('place_bet', {
        p_bet_id: bet.id,
        p_user_id: user.id,
        p_option: selectedOption,
        p_amount: amount
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
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="font-semibold mb-2 flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                {bet.optionA}
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatOdds(oddsA)}x
              </div>
              <Button
                className="mt-2 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBetClick('A');
                }}
                disabled={!isActive || isPlacingBet}
              >
                {bet.optionA}
              </Button>
            </div>
            
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="font-semibold mb-2 flex items-center justify-center gap-2">
                <X className="w-5 h-5" />
                {bet.optionB}
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatOdds(oddsB)}x
              </div>
              <Button
                className="mt-2 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBetClick('B');
                }}
                disabled={!isActive || isPlacingBet}
              >
                {bet.optionB}
              </Button>
            </div>
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

      {/* Place Bet Dialog */}
      <Dialog open={placeBetDialogOpen} onOpenChange={setPlaceBetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="betAmount" className="text-sm font-medium mb-2 block">
              Bet Amount (€)
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
            <Button variant="outline" onClick={() => setPlaceBetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceBet} disabled={isPlacingBet}>
              {isPlacingBet ? "Placing Bet..." : "Confirm Bet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bets Dialog */}
      <Dialog open={viewBetsDialogOpen} onOpenChange={setViewBetsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Placed Bets - {bet.eventName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {betPlacements?.map((placement, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg"
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {placement.option === 'A' ? (
                        <>
                          <Check className="w-4 h-4" />
                          {bet.optionA}
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          {bet.optionB}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(placement.created_at), "HH:mm d.M")}
                    </div>
                  </div>
                  <div className="font-semibold">
                    €{placement.amount.toFixed(2)}
                  </div>
                </div>
              ))}
              {(!betPlacements || betPlacements.length === 0) && (
                <div className="text-center text-muted-foreground">
                  No bets placed yet
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewBetsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};