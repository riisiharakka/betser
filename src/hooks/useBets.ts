import { useQuery } from "@tanstack/react-query";
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
      return data;
    },
  });
};