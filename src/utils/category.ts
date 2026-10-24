import { Analysis } from '../types/analysis';

// Home-page segregation: every analysis is either day-to-day "Policy Pulse"
// macro/policy tracking, or "Stock Research" (deep-dives, market notes,
// institutional flows, etc.). Classification lives here so the hook, the tab
// bar, and any counts all agree.
export type Category = 'all' | 'stocks' | 'policy';

const POLICY_TAGS = new Set(['policy-pulse', 'policy-tracker']);

export function isPolicyPulse(a: Analysis): boolean {
  return a.tags.some((t) => POLICY_TAGS.has(t.toLowerCase())) || /^policy pulse\b/i.test(a.title);
}

export function getCategory(a: Analysis): Exclude<Category, 'all'> {
  return isPolicyPulse(a) ? 'policy' : 'stocks';
}
