export interface MarketSnapshot {
  fiiNet: number;
  diiNet: number;
  nifty: { value: number; change: number };
  niftyIT: { value: number; change: number };
  bankNifty: { value: number; change: number };
}

export interface DailyFlow {
  date: string;
  fii: number;
  dii: number;
}

// Simulated market data — in production, replace with real API
export function getMarketSnapshot(): MarketSnapshot {
  const baseNifty = 24150;
  const baseNiftyIT = 36100;
  const baseBank = 52800;

  return {
    fiiNet: -843,
    diiNet: 3637,
    nifty: { value: baseNifty + Math.round((Math.random() - 0.5) * 200), change: +(Math.random() * 1.5 - 0.8).toFixed(2) },
    niftyIT: { value: baseNiftyIT + Math.round((Math.random() - 0.5) * 400), change: +(Math.random() * 2 - 1).toFixed(2) },
    bankNifty: { value: baseBank + Math.round((Math.random() - 0.5) * 300), change: +(Math.random() * 1.2 - 0.6).toFixed(2) },
  };
}

export function get10DayFlows(): DailyFlow[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
  }
  return dates.map(d => ({
    date: d,
    fii: Math.round((Math.random() - 0.3) * 3000),
    dii: Math.round((Math.random() - 0.5) * 2500 + 1500),
  }));
}
