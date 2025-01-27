import { AdminLayout } from "@/layouts/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBets } from "@/hooks/useBets";
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

  const handleResolve = async (betId: string, winner: string) => {
    try {
      const { error } = await supabase
        .from("bets")
        .update({ winner, is_resolved: true })
        .eq("id", betId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bet has been resolved successfully",
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
                    <span className="text-green-500">Resolved</span>
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