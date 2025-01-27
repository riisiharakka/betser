import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, DollarSign, AlertCircle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface MoneyOwedProps {
  user: SupabaseUser | null;
}

interface MoneyOwedRecord {
  winner_id: string;
  debtor_id: string;
  event_name: string;
  winning_option: string;
  bet_amount: number;
  winnings: number;
  profit: number;
  winner_username: string;
  debtor_username: string;
}

export const MoneyOwed = ({ user }: MoneyOwedProps) => {
  const { data: moneyOwed, isLoading } = useQuery({
    queryKey: ["money-owed", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("money_owed")
        .select("*");

      if (error) throw error;
      return data as MoneyOwedRecord[];
    },
    enabled: !!user,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-secondary/10 rounded-lg animate-pulse" />
        <div className="h-24 bg-secondary/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!moneyOwed?.length) {
    return (
      <Card className="bg-[#0A0B0F] border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl">Money Owed</CardTitle>
          <CardDescription>No active debts or earnings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const amIDebtor = (record: MoneyOwedRecord) => record.debtor_id === user.id;

  return (
    <div className="space-y-4">
      {moneyOwed.map((record, index) => (
        <Card key={index} className="bg-[#0A0B0F] border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              {record.event_name}
            </CardTitle>
            <CardDescription>
              Winning option: {record.winning_option}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {amIDebtor(record)
                    ? `You owe ${record.winner_username}`
                    : `${record.debtor_username} owes you`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  €{record.winnings.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Original bet: €{record.bet_amount.toFixed(2)} | Profit: €
              {record.profit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};