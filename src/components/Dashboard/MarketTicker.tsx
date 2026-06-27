import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getMarketSnapshot, MarketSnapshot } from '../../services/marketService';

export default function MarketTicker() {
  const [data, setData] = useState<MarketSnapshot | null>(null);

  useEffect(() => {
    setData(getMarketSnapshot());
    const interval = setInterval(() => setData(getMarketSnapshot()), 120000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const items = [
    { label: 'FII', value: data.fiiNet, suffix: ' Cr', arrow: true },
    { label: 'DII', value: data.diiNet, suffix: ' Cr', arrow: true },
    { label: 'Nifty', value: data.nifty.value.toLocaleString('en-IN'), change: data.nifty.change },
    { label: 'Nifty IT', value: data.niftyIT.value.toLocaleString('en-IN'), change: data.niftyIT.change },
    { label: 'Bank Nifty', value: data.bankNifty.value.toLocaleString('en-IN'), change: data.bankNifty.change },
  ];

  // Double the items for seamless marquee
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden py-1.5 sm:py-2" style={{ background: '#0a0f1e', borderBottom: '1px solid var(--border)' }}>
      <div className="flex animate-marquee gap-6 sm:gap-10 whitespace-nowrap">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[0.65rem] sm:text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>{item.label}</span>
            {'change' in item && item.change !== undefined ? (
              <>
                <span className="text-[0.7rem] sm:text-sm font-semibold tabular-nums" style={{ color: 'var(--text)' }}>{item.value}</span>
                <span className={`text-[0.6rem] sm:text-xs font-medium flex items-center gap-0.5 ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(item.change).toFixed(2)}%
                </span>
              </>
            ) : (
              <>
                <span className={`text-[0.7rem] sm:text-sm font-semibold tabular-nums ${item.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.value >= 0 ? '+' : ''}{item.value}{item.suffix}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
