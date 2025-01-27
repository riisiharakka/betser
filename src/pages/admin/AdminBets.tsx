import { AdminLayout } from "@/layouts/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBets, useInvalidateBets } from "@/hooks/useBets";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminBets = () => {
  const { data: bets, isLoading } = useBets();
  const { toast } = useToast();
  const invalidateBets = useInvalidateBets();

  const handleResolve = async (betId: string, winner: string) => {
    try {
      console.log("Resolving bet:", betId, "with winner:", winner);
      
      const bet = bets?.find(b => b.id === betId);
      if (!bet) {
        throw new Error("Bet not found");
      }

      // Map 'A' or 'B' to the actual option name
      const winningOption = winner === 'A' ? bet.optionA : bet.optionB;
      console.log("Winning option:", winningOption);

      // Update the bet with the winner and mark it as resolved
      const { error } = await supabase
        .from("bets")
        .update({ 
          winner: winningOption, 
          is_resolved: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", betId);

      if (error) {
        console.error("Error updating bet:", error);
        throw error;
      }

      // Invalidate both queries to refresh the data
      await invalidateBets();

      toast({
        title: "Success",
        description: `Bet has been resolved with winner: ${winningOption}`,
      });
    } catch (error) {
      console.error("Error resolving bet:", error);
      toast({
        title: "Error",
        description: "Failed to resolve bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="h-8 bg-secondary/10 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-secondary/10 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Pool Size</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bets?.map((bet) => (
              <TableRow key={bet.id}>
                <TableCell>{bet.eventName}</TableCell>
                <TableCell>
                  {bet.optionA} vs {bet.optionB}
                </TableCell>
                <TableCell>€{(bet.poolA + bet.poolB).toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(bet.endTime), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {bet.isResolved ? (
                    <span className="text-green-500">Resolved ({bet.winner})</span>
                  ) : new Date(bet.endTime) > new Date() ? (
                    <span className="text-blue-500">Active</span>
                  ) : (
                    <span className="text-yellow-500">Ended</span>
                  )}
                </TableCell>
                <TableCell>
                  {!bet.isResolved && new Date(bet.endTime) <= new Date() && (
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(value) => handleResolve(bet.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select winner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">{bet.optionA}</SelectItem>
                          <SelectItem value="B">{bet.optionB}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminBets;