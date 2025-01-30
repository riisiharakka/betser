import { Button } from "@/components/ui/button";
import { BetList } from "@/components/BetList";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";

interface IndexProps {
  user: User | null;
}

const Index = ({ user }: IndexProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['wager', 'dare']));
  
  const handleCreateBet = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a bet.",
      });
      navigate("/auth");
      return;
    }
    navigate("/create-bet");
  };

  const toggleType = (type: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      if (newTypes.size > 1) { // Prevent deselecting all types
        newTypes.delete(type);
      }
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Active Bets</h1>
            <p className="text-muted-foreground">
              Place your bets on various events with dynamic odds
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleCreateBet}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            Create New Bet
          </Button>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            variant={selectedTypes.has('wager') ? "default" : "outline"}
            onClick={() => toggleType('wager')}
            className="flex-1 sm:flex-none"
          >
            Wagers
          </Button>
          <Button
            variant={selectedTypes.has('dare') ? "default" : "outline"}
            onClick={() => toggleType('dare')}
            className="flex-1 sm:flex-none"
          >
            Dares
          </Button>
        </div>
        
        <BetList user={user} selectedTypes={Array.from(selectedTypes)} />
      </div>
    </div>
  );
};

export default Index;