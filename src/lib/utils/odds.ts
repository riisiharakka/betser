export const calculateOdds = (poolA: number, poolB: number) => {
  const totalPool = poolA + poolB;
  
  if (totalPool === 0) {
    return { oddsA: 2, oddsB: 2 }; // Default even odds
  }

  const oddsA = totalPool / poolA || 2;
  const oddsB = totalPool / poolB || 2;

  return {
    oddsA: Number(oddsA.toFixed(2)),
    oddsB: Number(oddsB.toFixed(2))
  };
};

export const formatOdds = (odds: number): string => {
  return odds.toFixed(2);
};

export const calculatePotentialWinnings = (betAmount: number, odds: number): number => {
  return Number((betAmount * odds).toFixed(2));
};