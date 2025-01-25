import { Bet } from "@/lib/types";
import { BetCard } from "./BetCard";

// Sample data for demonstration
const SAMPLE_BETS: Bet[] = [
  {
    id: "1",
    eventName: "Coin Flip #1",
    optionA: "Heads",
    optionB: "Tails",
    poolA: 100,
    poolB: 200,
    endTime: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes from now
    isResolved: false,
    createdBy: "system"
  },
  {
    id: "2",
    eventName: "Daily Dice Roll",
    optionA: "Even",
    optionB: "Odd",
    poolA: 500,
    poolB: 500,
    endTime: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    isResolved: false,
    createdBy: "system"
  }
];

export const BetList = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {SAMPLE_BETS.map((bet) => (
        <BetCard key={bet.id} bet={bet} />
      ))}
    </div>
  );
};