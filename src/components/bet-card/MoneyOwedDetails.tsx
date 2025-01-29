import { User } from "@supabase/supabase-js";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MoneyOwedDetailsProps {
  eventName: string;
  isResolved: boolean;
  user: User | null;
  existingBet: any;
  currency: string;
}

export const MoneyOwedDetails = ({ eventName, isResolved, user, existingBet, currency }: MoneyOwedDetailsProps) => {
  const { data: moneyOwedList } = useQuery({
    queryKey: ["money-owed", eventName, user?.id],
    queryFn: async () => {
      if (!user || !isResolved) return null;
      
      const { data, error } = await supabase
        .from("money_owed")
        .select("*")
        .eq("event_name", eventName)
        .or(`winner_id.eq.${user.id},debtor_id.eq.${user.id}`);
      
      if (error) {
        console.error("Error fetching money owed:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user && isResolved,
  });

  if (!moneyOwedList || !user || !moneyOwedList.length) return null;

  const winningTransactions = moneyOwedList.filter(t => t.winner_id === user.id);
  const debtTransactions = moneyOwedList.filter(t => t.debtor_id === user.id);

  return (
    <div className="space-y-4 border-t border-gray-800 pt-4 mt-4">
      {winningTransactions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Users who owe you:</span>
          </div>
          {winningTransactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between pl-6">
              <span className="text-sm">{transaction.debtor_username}</span>
              <span className="text-sm text-green-500">
                {Math.abs(transaction.profit).toFixed(2)} {currency}
              </span>
            </div>
          ))}
        </div>
      )}

      {debtTransactions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>You owe:</span>
          </div>
          {debtTransactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between pl-6">
              <span className="text-sm">{transaction.winner_username}</span>
              <span className="text-sm text-red-500">
                {Math.abs(transaction.profit).toFixed(2)} {currency}
              </span>
            </div>
          ))}
        </div>
      )}

      {existingBet && (
        <div className="text-sm text-muted-foreground">
          Your bet: {existingBet.amount.toFixed(2)} {currency}
        </div>
      )}
    </div>
  );
};