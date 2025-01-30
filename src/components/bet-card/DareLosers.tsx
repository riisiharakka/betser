import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DareLosersProps {
  betId: string;
  winner: string;
}

export const DareLosers = ({ betId, winner }: DareLosersProps) => {
  const { data: losers = [] } = useQuery({
    queryKey: ["dare-losers", betId],
    queryFn: async () => {
      const losingOption = winner === 'A' ? 'B' : 'A';
      
      const { data, error } = await supabase
        .from("bet_placements")
        .select(`
          user_id,
          profiles (
            username
          )
        `)
        .eq("bet_id", betId)
        .eq("option", losingOption);

      if (error) throw error;
      return data?.map(loser => ({
        userId: loser.user_id,
        username: loser.profiles?.username || 'Anonymous'
      })) || [];
    },
    enabled: !!betId && !!winner,
  });

  if (!losers.length) return null;

  return (
    <div className="mt-4 text-center">
      <h4 className="text-lg text-muted-foreground mb-2">
        Lost the dare ({losers.length}):
      </h4>
      <div className="flex flex-wrap justify-center gap-2">
        {losers.map((loser) => (
          <div
            key={loser.userId}
            className="flex items-center gap-1 bg-secondary/20 rounded-full px-3 py-1"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{loser.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};