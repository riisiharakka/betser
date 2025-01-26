import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlaceBetFormProps {
  betId: string;
  userId: string;
  selectedOption: string;
  onBetPlaced: () => void;
}

export const PlaceBetForm = ({
  betId,
  userId,
  selectedOption,
  onBetPlaced,
}: PlaceBetFormProps) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc("place_bet", {
        p_bet_id: betId,
        p_user_id: userId,
        p_option: selectedOption,
        p_amount: Number(amount),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your bet has been placed successfully",
      });
      
      setAmount("");
      onBetPlaced();
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="flex-1"
      />
      <Button type="submit" disabled={isSubmitting}>
        Place Bet
      </Button>
    </form>
  );
};