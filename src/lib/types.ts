export interface Bet {
  id: string;
  eventName: string;
  optionA: string;
  optionB: string;
  poolA: number;
  poolB: number;
  endTime: Date;
  isResolved: boolean;
  winner?: 'A' | 'B';
  createdBy: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface BetPlacement {
  betId: string;
  userId: string;
  option: 'A' | 'B';
  amount: number;
  timestamp: Date;
}