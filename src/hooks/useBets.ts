import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBets = () => {
  return useQuery({
    queryKey: ["bets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Ensure numeric values are properly formatted and map database fields to frontend model
      return data.map(bet => ({
        id: bet.id,
        eventName: bet.event_name,
        optionA: bet.option_a,
        optionB: bet.option_b,
        poolA: Number(bet.pool_a),
        poolB: Number(bet.pool_b),
        endTime: new Date(bet.end_time),
        isResolved: bet.is_resolved,
        winner: bet.winner,
        createdBy: bet.created_by,
        maxBetSize: bet.max_bet_size ? Number(bet.max_bet_size) : null
      }));
    },
    staleTime: 0, // This ensures we always get fresh data
  });
};

export const useInvalidateBets = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate both bets and myBets queries
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["bets"] }),
      queryClient.invalidateQueries({ queryKey: ["myBets"] })
    ]);
  };
};