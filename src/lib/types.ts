export interface Bet {
  id: string;
  event_name: string;
  option_a: string;
  option_b: string;
  pool_a: number;
  pool_b: number;
  end_time: Date;
  is_resolved: boolean;
  winner?: string | null;
  created_by: string;
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