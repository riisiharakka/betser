interface BetStatusProps {
  isResolved: boolean;
  winner: string | null;
  optionA: string;
  optionB: string;
}

export const BetStatus = ({ isResolved, winner, optionA, optionB }: BetStatusProps) => {
  if (!isResolved) return null;

  return (
    <p className="text-lg text-muted-foreground text-center">
      Bet: {winner === "A" ? optionA : optionB}
    </p>
  );
};