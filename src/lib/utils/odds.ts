export const calculateOdds = (poolA: number, poolB: number) => {
  const totalPool = poolA + poolB;
  
  // If either pool is empty, return default odds of 2
  if (poolA === 0 || poolB === 0) {
    return { oddsA: 2, oddsB: 2 };
  }

  // Calculate odds based on pool ratios
  const oddsA = totalPool / poolA;
  const oddsB = totalPool / poolB;

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