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
import { format } from "date-fns";
import { Check, X, Clock, Archive, ArrowLeft, Trophy, Ban } from "lucide-react";
import { calculateOdds, formatOdds } from "@/lib/utils/odds";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoneyOwed } from "@/components/MoneyOwed";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface MyBetsProps {
  user: User | null;
}

const MyBets = ({ user }: MyBetsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showMoneyOwed, setShowMoneyOwed] = useState(false);

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
                    <TableRow key={`${bet.bets.id}-${bet.created_at}`}>
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
                            className={`${status.color} text-white flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity`}
                            onClick={() => setShowMoneyOwed(true)}
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={showMoneyOwed} onOpenChange={setShowMoneyOwed}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Money Owed</DialogTitle>
              <DialogDescription>
                Here's a summary of your current debts and earnings
              </DialogDescription>
            </DialogHeader>
            <MoneyOwed user={user} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyBets;