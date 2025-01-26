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
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <Button
          onClick={() => onSelectOption("A")}
          variant={selectedOption === "A" ? "default" : "outline"}
          disabled={isDisabled}
          className="w-full mb-2"
        >
          {optionA}
        </Button>
        <div className="text-sm text-muted-foreground">
          Pool: ${poolA.toFixed(2)}
          <br />
          Odds: {getOdds(poolA)}x
        </div>
      </div>

      <div>
        <Button
          onClick={() => onSelectOption("B")}
          variant={selectedOption === "B" ? "default" : "outline"}
          disabled={isDisabled}
          className="w-full mb-2"
        >
          {optionB}
        </Button>
        <div className="text-sm text-muted-foreground">
          Pool: ${poolB.toFixed(2)}
          <br />
          Odds: {getOdds(poolB)}x
        </div>
      </div>
    </div>
  );
};