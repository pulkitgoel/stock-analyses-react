import { Analysis } from '../types/analysis';

const API_BASE = '/api';

const FALLBACK_ANALYSES: Analysis[] = [
  {
    title: 'Palantir (PLTR) - Why Is It Falling & What Should Investors Do?',
    ticker: 'PLTR',
    file: 'pltr-why-falling-jun26.html',
    slug: 'pltr-why-falling-jun26',
    date: '2026-06-26',
    tags: ['us-stocks', 'ai', 'valuation', 'technical'],
    summary: 'Updated PLTR risk, valuation, technical setup, and investor action framework after the recent selloff.',
  },
  {
    title: 'Institutional Gems - Weekly Tracker',
    ticker: 'NSE',
    file: 'institutional-gems-weekly-jun25.html',
    slug: 'institutional-gems-weekly-jun25',
    date: '2026-06-25',
    tags: ['institutional-gems', 'fii-dii', 'market-analysis'],
    summary: 'A weekly tracker of stocks seeing notable institutional buying, block deals, and market activity.',
  },
  {
    title: 'FII & DII Activity Report',
    ticker: 'NSE',
    file: 'fii-dii-institutional-attraction-june25.html',
    slug: 'fii-dii-institutional-attraction-june25',
    date: '2026-06-25',
    tags: ['fii-dii', 'market-analysis', 'institutional-gems'],
    summary: 'Cash market flows and notable institutional buys and sells from recent market activity.',
  },
  {
    title: 'Action Construction Equipment (ACE) - Deep Dive',
    ticker: 'ACE',
    file: 'ace-deep-dive-jun23.html',
    slug: 'ace-deep-dive-jun23',
    date: '2026-06-23',
    tags: ['deep-dive', 'fundamental', 'construction'],
    summary: 'Corrected fundamental snapshot and valuation review for Action Construction Equipment.',
  },
  {
    title: 'Why Markets Crashed Today',
    ticker: 'NIFTY',
    file: 'market-crash-jun23.html',
    slug: 'market-crash-jun23',
    date: '2026-06-23',
    tags: ['market-analysis', 'crash', 'fii-dii'],
    summary: 'A concise breakdown of the key triggers behind the Indian market correction.',
  },
  {
    title: 'US Markets Crashed',
    ticker: 'US',
    file: 'us-market-crash-jun23.html',
    slug: 'us-market-crash-jun23',
    date: '2026-06-23',
    tags: ['market-analysis', 'crash', 'us-stocks', 'global'],
    summary: 'Macro and portfolio impact notes from the US market selloff.',
  },
  {
    title: 'IT Stocks Bloodbath - The Full Story',
    ticker: 'IT',
    file: 'it-stocks-bloodbath-jun19.html',
    slug: 'it-stocks-bloodbath-jun19',
    date: '2026-06-19',
    tags: ['it-sector', 'market-analysis', 'crash'],
    summary: 'Sector-level analysis of the selloff in IT stocks and what changed in the setup.',
  },
  {
    title: 'Palantir Technologies Inc. (PLTR) - Deep Dive Analysis',
    ticker: 'PLTR',
    file: 'palantir-pltr-deep-dive-jun18.html',
    slug: 'palantir-pltr-deep-dive-jun18',
    date: '2026-06-18',
    tags: ['us-stocks', 'ai', 'deep-dive', 'valuation'],
    summary: 'Business, technicals, valuation, risks, and bull-bear setup for Palantir.',
  },
  {
    title: 'CG Power & Industrial Solutions Ltd - Deep Dive Analysis',
    ticker: 'CGPOWER',
    file: 'cg-power-deep-dive-jun18.html',
    slug: 'cg-power-deep-dive-jun18',
    date: '2026-06-18',
    tags: ['deep-dive', 'fundamental', 'infrastructure'],
    summary: 'A fundamental review of CG Power covering growth, valuation, order book, and risks.',
  },
  {
    title: 'Kaynes Technology India Ltd - Deep Dive Analysis',
    ticker: 'KAYNES',
    file: 'kaynes-technology-deep-dive-jun18.html',
    slug: 'kaynes-technology-deep-dive-jun18',
    date: '2026-06-18',
    tags: ['deep-dive', 'fundamental', 'electronics'],
    summary: 'Deep-dive on Kaynes Technology, including financials, catalysts, and valuation considerations.',
  },
  {
    title: 'Kaynes Technology & CG Power - Deep Dive Analysis',
    ticker: 'KAYNES/CGPOWER',
    file: 'kaynes-cg-power-deep-dive-jun18.html',
    slug: 'kaynes-cg-power-deep-dive-jun18',
    date: '2026-06-18',
    tags: ['deep-dive', 'fundamental', 'electronics'],
    summary: 'Comparative analysis of Kaynes and CG Power across growth, valuation, and execution risk.',
  },
  {
    title: 'Ideaforge Technology Ltd - Deep Dive Analysis',
    ticker: 'IDEAFORGE',
    file: 'ideaforge-deep-dive-jun18.html',
    slug: 'ideaforge-deep-dive-jun18',
    date: '2026-06-18',
    tags: ['deep-dive', 'defense', 'fundamental'],
    summary: 'Fundamental and catalyst review for Ideaforge Technology in the drone and defense theme.',
  },
  {
    title: 'AMD - AI GPU Battle Heats Up, But Is the Price Right?',
    ticker: 'AMD',
    file: 'amd-deep-dive-jun17.html',
    slug: 'amd-deep-dive-jun17',
    date: '2026-06-17',
    tags: ['us-stocks', 'ai', 'deep-dive', 'valuation'],
    summary: 'AMD analysis covering AI GPU catalysts, financials, technicals, risks, and valuation.',
  },
  {
    title: 'Reliance Industries Ltd - Deep Dive',
    ticker: 'RELIANCE',
    file: 'reliance-deep-dive-jun17.html',
    slug: 'reliance-deep-dive-jun17',
    date: '2026-06-17',
    tags: ['deep-dive', 'fundamental'],
    summary: 'Technical, fundamental, news, delivery, and entry strategy review for Reliance.',
  },
  {
    title: 'Trent Ltd - Deep Dive Analysis',
    ticker: 'TRENT',
    file: 'trent-deep-dive-jun17.html',
    slug: 'trent-deep-dive-jun17',
    date: '2026-06-17',
    tags: ['deep-dive', 'retail', 'fundamental'],
    summary: 'Trent analysis covering valuation, shareholding, catalysts, and investor framework.',
  },
  {
    title: 'NALCO - Why the Stock is Down Today',
    ticker: 'NATIONALUM',
    file: 'nalco-down-root-cause-jun16.html',
    slug: 'nalco-down-root-cause-jun16',
    date: '2026-06-16',
    tags: ['market-analysis', 'fundamental'],
    summary: 'Root-cause note on NALCO weakness, aluminium prices, secondary pressures, and bull case.',
  },
  {
    title: 'Netweb Technologies - Why the Stock is Rising',
    ticker: 'NETWEB',
    file: 'netweb-technologies-deep-dive.html',
    slug: 'netweb-technologies-deep-dive',
    date: '2026-06-16',
    tags: ['deep-dive', 'ai', 'fundamental'],
    summary: 'Catalyst and financial review for Netweb Technologies after its recent strength.',
  },
  {
    title: 'HCL Tech invests Rs 1,427 Cr in Sarvam AI',
    ticker: 'HCLTECH',
    file: 'hcltech-sarvam-ai-acquisition.html',
    slug: 'hcltech-sarvam-ai-acquisition',
    date: '2026-06-16',
    tags: ['ai', 'it-sector', 'fundamental'],
    summary: 'Analysis of HCL Tech investment in Sarvam AI and its strategic implications.',
  },
];

export async function fetchAnalyses(): Promise<Analysis[]> {
  try {
    const res = await fetch(`${API_BASE}/analyses`);
    if (!res.ok) throw new Error('Failed to fetch analyses');
    const data = await res.json();
    return (data.analyses || []).map((a: Analysis) => ({
      ...a,
      slug: a.slug || a.file.replace('.html', ''),
    }));
  } catch {
    return FALLBACK_ANALYSES;
  }
}

export async function fetchAnalysisContent(slug: string): Promise<string> {
  const res = await fetch(`/analyses/${slug}.md`);
  if (!res.ok) throw new Error('Content not found');
  return res.text();
}
