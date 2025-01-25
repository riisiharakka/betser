import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bet } from "@/lib/types";
import { calculateOdds, formatOdds } from "@/lib/utils/odds";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

interface BetCardProps {
  bet: Bet;
  user: User | null;
}

export const BetCard = ({ bet, user }: BetCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { oddsA, oddsB } = calculateOdds(bet.poolA, bet.poolB);
  const totalPool = bet.poolA + bet.poolB;
  const timeLeft = new Date(bet.endTime).getTime() - new Date().getTime();
  const isActive = timeLeft > 0;

  const handleBetClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place a bet.",
      });
      navigate("/auth");
      return;
    }
    // ... handle bet placement logic when implemented
  };

  return (
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
              onClick={handleBetClick}
              disabled={!isActive}
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
              onClick={handleBetClick}
              disabled={!isActive}
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
  );
};