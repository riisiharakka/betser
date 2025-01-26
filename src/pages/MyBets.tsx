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
import { Check, X, Clock, Archive, ArrowLeft } from "lucide-react";
import { calculateOdds, formatOdds } from "@/lib/utils/odds";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
                  const timeLeft = new Date(bet.bets.end_time).getTime() - new Date().getTime();
                  const isActive = timeLeft > 0;
                  const { oddsA, oddsB } = calculateOdds(bet.bets.pool_a, bet.bets.pool_b);
                  const odds = bet.option === 'A' ? oddsA : oddsB;
                  const potentialWin = (bet.amount * odds).toFixed(2);
                  const option = bet.option === 'A' ? bet.bets.option_a : bet.bets.option_b;

                  let status;
                  let statusColor;
                  let StatusIcon;

                  if (!bet.bets.is_resolved && isActive) {
                    status = "Open";
                    statusColor = "text-blue-500";
                    StatusIcon = Clock;
                  } else if (!bet.bets.is_resolved && !isActive) {
                    status = "Closed";
                    statusColor = "text-gray-500";
                    StatusIcon = Archive;
                  } else if (bet.bets.winner === bet.option) {
                    status = "Won";
                    statusColor = "text-green-500";
                    StatusIcon = Check;
                  } else {
                    status = "Lost";
                    statusColor = "text-red-500";
                    StatusIcon = X;
                  }

                  return (
                    <TableRow key={`${bet.bets.id}-${bet.created_at}`}>
                      <TableCell className="font-medium">
                        {bet.bets.event_name}
                      </TableCell>
                      <TableCell>{option}</TableCell>
                      <TableCell>€{bet.amount.toFixed(2)}</TableCell>
                      <TableCell>€{potentialWin}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 ${statusColor}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status}
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
      </div>
    </div>
  );
};

export default MyBets;