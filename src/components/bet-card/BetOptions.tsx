import { Button } from "@/components/ui/button";

interface BetOptionsProps {
  optionA: string;
  optionB: string;
  poolA: number;
  poolB: number;
  onSelectOption: (option: string) => void;
  selectedOption: string | null;
  isDisabled: boolean;
}

export const BetOptions = ({
  optionA,
  optionB,
  poolA,
  poolB,
  onSelectOption,
  selectedOption,
  isDisabled,
}: BetOptionsProps) => {
  const totalPool = poolA + poolB;
  const getOdds = (pool: number) => {
    if (totalPool === 0) return 2;
    return ((totalPool + pool) / pool).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="text-2xl font-medium text-center">Bet on</div>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <Button
            onClick={() => onSelectOption("A")}
            variant={selectedOption === "A" ? "default" : "outline"}
            disabled={isDisabled}
            className="w-full py-6 text-lg"
          >
            {optionA}
          </Button>
          <div className="text-3xl font-bold text-center">
            {getOdds(poolA)}x
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => onSelectOption("B")}
            variant={selectedOption === "B" ? "default" : "outline"}
            disabled={isDisabled}
            className="w-full py-6 text-lg"
          >
            {optionB}
          </Button>
          <div className="text-3xl font-bold text-center">
            {getOdds(poolB)}x
          </div>
        </div>
      </div>

      <div className="text-center text-muted-foreground">
        Total Pool: €{totalPool.toFixed(2)}
      </div>
    </div>
  );
};