import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { Check, X, Clock, Archive, ArrowLeft, Trophy, Ban, DollarSign, User as UserIcon } from "lucide-react";
import { calculateOdds } from "@/lib/utils/odds";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MyBetsProps {
  user: User | null;
}

const MyBets = ({ user }: MyBetsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: bets, isLoading } = useQuery({
    queryKey: ["myBets", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("bet_placements")
        .select(`
          amount,
          option,
          created_at,
          is_paid,
          bets (
            id,
            event_name,
            option_a,
            option_b,
            pool_a,
            pool_b,
            end_time,
            is_resolved,
            winner
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: moneyOwedMap } = useQuery({
    queryKey: ["money-owed-map", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .from("money_owed")
        .select("*")
        .or(`winner_id.eq.${user.id},debtor_id.eq.${user.id}`);
      
      // Create a map of event names to money owed records
      return data?.reduce((acc, curr) => {
        acc[curr.event_name] = curr;
        return acc;
      }, {} as Record<string, any>) || {};
    },
    enabled: !!user,
  });

  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please log in to view your bets.",
    });
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const getBetStatus = (bet: any) => {
    const timeLeft = new Date(bet.bets.end_time).getTime() - new Date().getTime();
    const isActive = timeLeft > 0;

    if (!bet.bets.is_resolved && isActive) {
      return {
        label: "Open",
        color: "bg-blue-500",
        Icon: Clock,
        description: "Bet is still open"
      };
    } else if (!bet.bets.is_resolved && !isActive) {
      return {
        label: "Closed",
        color: "bg-gray-500",
        Icon: Archive,
        description: "Waiting for results"
      };
    } else if (bet.bets.winner === bet.option) {
      return {
        label: "Won",
        color: "bg-green-500",
        Icon: Trophy,
        description: "You won this bet!"
      };
    } else {
      return {
        label: "Lost",
        color: "bg-red-500",
        Icon: Ban,
        description: "Better luck next time"
      };
    }
  };

  const renderMoneyOwedDetails = (eventName: string) => {
    const moneyOwed = moneyOwedMap?.[eventName];
    if (!moneyOwed || !user) return null;

    const isDebtor = moneyOwed.debtor_id === user.id;
    const otherParty = isDebtor ? moneyOwed.winner_username : moneyOwed.debtor_username;
    
    if (!otherParty) return null;

    return (
      <div className="space-y-4 border-t border-gray-800 mt-4 pt-4">
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
              €{moneyOwed.winnings?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
        {moneyOwed.bet_amount && moneyOwed.profit && (
          <div className="text-sm text-muted-foreground">
            Original bet: €{moneyOwed.bet_amount.toFixed(2)} | Profit: €
            {moneyOwed.profit.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-4xl font-bold mb-8">My Bets</h1>
        
        {!bets?.length ? (
          <div className="text-center text-muted-foreground py-12">
            You haven't placed any bets yet.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Your Pick</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Potential Win</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bets.map((bet) => {
                  const { oddsA, oddsB } = calculateOdds(bet.bets.pool_a, bet.bets.pool_b);
                  const odds = bet.option === 'A' ? oddsA : oddsB;
                  const potentialWin = (bet.amount * odds).toFixed(2);
                  const option = bet.option === 'A' ? bet.bets.option_a : bet.bets.option_b;
                  const status = getBetStatus(bet);

                  return (
                    <Accordion type="single" collapsible key={`${bet.bets.id}-${bet.created_at}`}>
                      <AccordionItem value="item-1">
                        <TableRow>
                          <TableCell>
                            <AccordionTrigger />
                          </TableCell>
                          <TableCell className="font-medium">
                            {bet.bets.event_name}
                          </TableCell>
                          <TableCell>{option}</TableCell>
                          <TableCell>€{bet.amount.toFixed(2)}</TableCell>
                          <TableCell>€{potentialWin}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary"
                                className={`${status.color} text-white flex items-center gap-1`}
                              >
                                <status.Icon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {status.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(bet.created_at), "HH:mm d.M.yyyy")}
                          </TableCell>
                        </TableRow>
                        <AccordionContent>
                          <div className="px-6 py-4">
                            {renderMoneyOwedDetails(bet.bets.event_name)}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBets;