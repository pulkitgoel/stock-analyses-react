import { Analysis } from '../types/analysis';
import { kindOf } from './kind';

// Home-page segregation: every analysis is either a day-to-day Policy Pulse note
// or stock research. The rule itself lives in utils/kind.ts, which reads the
// value derived once at build time by scripts/lib/kind.js — this file used to
// re-implement the tag and title check, which is exactly the duplication that
// let the ticker rule (3.6) and the tag floor (7.5) drift.
export type Category = 'all' | 'stocks' | 'policy';

export function isPolicyPulse(a: Analysis): boolean {
  return kindOf(a) === 'pulse';
}

export function getCategory(a: Analysis): Exclude<Category, 'all'> {
  return isPolicyPulse(a) ? 'policy' : 'stocks';
}
