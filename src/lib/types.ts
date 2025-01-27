export interface Bet {
  id: string;
  eventName: string;
  optionA: string;
  optionB: string;
  poolA: number;
  poolB: number;
  endTime: Date;
  isResolved: boolean;
  winner?: string | null;
  createdBy: string;
  maxBetSize?: number | null;
}

export interface BetPlacement {
  id: string;
  betId: string;
  userId: string;
  option: string;
  amount: number;
  createdAt: Date;
}

export interface Profile {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}