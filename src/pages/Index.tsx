import { Button } from "@/components/ui/button";
import { BetList } from "@/components/BetList";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  
  const handleCreateBet = () => {
    toast({
      title: "Authentication Required",
      description: "Please log in to create a bet.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Active Bets</h1>
            <p className="text-muted-foreground">
              Place your bets on various events with dynamic odds
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleCreateBet}
            className="bg-primary hover:bg-primary/90"
          >
            Create New Bet
          </Button>
        </div>
        
        <BetList />
      </div>
    </div>
  );
};

export default Index;