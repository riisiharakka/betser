import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, ArrowRight, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface MoneyOwedListProps {
  user: User | null;
}

export const MoneyOwedList = ({ user }: MoneyOwedListProps) => {
  const { data: moneyOwed = [] } = useQuery({
    queryKey: ["money-owed-list", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase
        .from("money_owed")
        .select("*")
        .or(`winner_id.eq.${user.id},debtor_id.eq.${user.id}`);
      
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card className="bg-[#0A0B0F] border-gray-800">
        <CardHeader>
          <CardTitle>Money Owed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to view money owed information.</p>
        </CardContent>
      </Card>
    );
  }

  const moneyToReceive = moneyOwed.filter(m => m.winner_id === user.id);
  const moneyToPay = moneyOwed.filter(m => m.debtor_id === user.id);
  const totalToReceive = moneyToReceive.reduce((sum, m) => sum + (m.winnings || 0), 0);
  const totalToPay = moneyToPay.reduce((sum, m) => sum + (m.winnings || 0), 0);

  return (
    <Card className="bg-[#0A0B0F] border-gray-800">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Money Owed</span>
          <div className="text-sm font-normal">
            <span className="text-green-500 mr-4">
              To Receive: €{totalToReceive.toFixed(2)}
            </span>
            <span className="text-red-500">
              To Pay: €{totalToPay.toFixed(2)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {moneyToReceive.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-500">Money to Receive</h3>
            {moneyToReceive.map((money, index) => (
              <div key={`receive-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>{money.debtor_username}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span>You</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-green-500">€{money.winnings?.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    Event: {money.event_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {moneyToPay.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-500">Money to Pay</h3>
            {moneyToPay.map((money, index) => (
              <div key={`pay-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-500" />
                  <span>You</span>
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                  <span>{money.winner_username}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-red-500">€{money.winnings?.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    Event: {money.event_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {moneyToReceive.length === 0 && moneyToPay.length === 0 && (
          <p className="text-center text-muted-foreground">
            No money owed at the moment
          </p>
        )}
      </CardContent>
    </Card>
  );
};