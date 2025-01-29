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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AdminBets = () => {
  const { data: bets, isLoading } = useBets();
  const { toast } = useToast();
  const invalidateBets = useInvalidateBets();

  const handleResolve = async (betId: string, winningOption: string) => {
    try {
      const bet = bets?.find(b => b.id === betId);
      if (!bet) {
        throw new Error("Bet not found");
      }

      const winner = winningOption === bet.optionA ? "A" : "B";

      const { error } = await supabase
        .from("bets")
        .update({ 
          winner,
          is_resolved: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", betId);

      if (error) {
        console.error("Error updating bet:", error);
        throw error;
      }

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

  const handleToggleHidden = async (betId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("bets")
        .update({ 
          is_hidden: !currentValue,
          updated_at: new Date().toISOString()
        })
        .eq("id", betId);

      if (error) {
        console.error("Error updating bet visibility:", error);
        throw error;
      }

      await invalidateBets();

      toast({
        title: "Success",
        description: `Bet has been ${!currentValue ? 'hidden from' : 'shown on'} the main page`,
      });
    } catch (error) {
      console.error("Error toggling bet visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update bet visibility. Please try again.",
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
              <TableHead>Visibility</TableHead>
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
                    <span className="text-green-500">
                      Resolved ({bet.winner === "A" ? bet.optionA : bet.optionB})
                    </span>
                  ) : new Date(bet.endTime) > new Date() ? (
                    <span className="text-blue-500">Active</span>
                  ) : (
                    <span className="text-yellow-500">Ended</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`hide-${bet.id}`}
                      checked={!bet.isHidden}
                      onCheckedChange={() => handleToggleHidden(bet.id, bet.isHidden)}
                    />
                    <Label htmlFor={`hide-${bet.id}`}>
                      {bet.isHidden ? 'Hidden' : 'Visible'}
                    </Label>
                  </div>
                </TableCell>
                <TableCell>
                  {!bet.isResolved && new Date(bet.endTime) <= new Date() && (
                    <Select onValueChange={(value) => handleResolve(bet.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select winner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={bet.optionA}>{bet.optionA}</SelectItem>
                        <SelectItem value={bet.optionB}>{bet.optionB}</SelectItem>
                      </SelectContent>
                    </Select>
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