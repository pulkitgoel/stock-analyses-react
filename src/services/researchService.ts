/**
 * Reader-requested research queue — the browser half.
 *
 * docs/RESEARCH-REQUESTS.md section 0: the reader never sends text that reaches
 * a prompt. The form is a picker over `universe.json`, and what is POSTed is an
 * id from that file. Nothing here trusts its own resolution — the server
 * re-resolves every submitted id against its own copy — but the picker is what
 * makes the honest path the only convenient one.
 */

export type Tier = 'broad' | 'main' | 'watch' | 'sme';

export interface Company {
  /** "NSE:KERNEX" or "NASDAQ:NVDA" — the only thing ever submitted. */
  id: string;
  sym: string;
  name: string;
  tier: Tier;
  industry: string;
  /** NSE | BSE | NASDAQ | NYSE | AMEX. Absent on older payloads, treated as NSE. */
  market?: string;
}

export interface QueueEntry {
  id: number;
  symbol: string;
  name: string;
  status: 'queued' | 'claimed' | 'published' | 'needs-owner' | 'rejected' | 'expired';
  votes: number;
  mode: 'new' | 'update';
  created_at: string;
  slug: string | null;
  published_at?: string;
  /** Where the work has got to while status is 'claimed'. */
  stage?: string | null;
  stage_at?: string | null;
  /** Set when the owner approves, before an agent claims it. */
  approved_at?: string | null;
  /** Seconds the queue estimates are still needed. */
  claimed_at?: string | null;
  eta_seconds?: number;
  eta_at?: string;
}

export interface QueueView {
  open: QueueEntry[];
  recent: QueueEntry[];
  limits: {
    accepted_per_day: number;
    per_requester_per_day: number;
    open: number;
    max_open: number;
    cover_days: number;
  };
}

export interface Verdict {
  state: 'unknown' | 'covered' | 'stale' | 'queued' | 'held' | 'ready';
  message: string;
  symbol?: string;
  name?: string;
  tier?: Tier;
  industry?: string;
  covered?: { slug: string; title: string; date: string };
  age_days?: number;
  request?: QueueEntry;
  requests_left?: number;
  slots_left?: number;
}

export interface SubmitResult {
  ok: boolean;
  status?: 'queued' | 'needs-owner';
  id?: number;
  name?: string;
  mode?: 'new' | 'update';
  message: string;
  /** Set when the refusal carries somewhere useful to go instead. */
  covered?: { slug: string; title: string; date: string };
  request?: QueueEntry;
}

// ---------------------------------------------------------------------------
// The universe, fetched once and lazily
// ---------------------------------------------------------------------------

// 150 KB. It is NOT fetched on page load — only when the reader first focuses
// the input — so it stays off the critical path of a page whose first paint is
// prerendered (AGENTS.md 3.14, 7.9).
let universePromise: Promise<Company[]> | null = null;

export function loadUniverse(): Promise<Company[]> {
  if (!universePromise) {
    // Two files, one picker. India is rebuilt from NSE's own lists and would lose
    // anything merged into it, so the US list ships beside it and both are read here.
    const files = ['/universe.json', '/universe-us.json'];
    universePromise = Promise.all(
      files.map((url) =>
        fetch(url)
          .then((res) => (res.ok ? res.json() : { rows: [], cols: [] }))
          .catch(() => ({ rows: [], cols: [] }))
      )
    )
      .then((payloads) =>
        payloads.flatMap((data: { rows?: string[][]; cols?: string[] }) => {
          const cols = data.cols || [];
          const hasMarket = cols.length >= 5 && cols[4] === 'market';
          return (data.rows || []).map((row) => ({
            id: `${hasMarket ? row[4] : 'NSE'}:${row[0]}`,
            sym: row[0],
            name: row[1],
            tier: row[2] as Tier,
            industry: row[3] || '',
            market: hasMarket ? row[4] : 'NSE',
          }));
        })
      )
      .catch((err) => {
        // Let the next focus try again rather than caching the failure.
        universePromise = null;
        throw err;
      });
  }
  return universePromise;
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Rank matches so the obvious answer is first.
 *
 * Typing "kec" should offer KEC International before the fourteen companies
 * whose name happens to contain those letters, so an exact symbol wins, then a
 * symbol prefix, then a word-start in the name, then anything else.
 */
export function searchUniverse(all: Company[], query: string, limit = 7): Company[] {
  const q = normalise(query);
  if (q.length < 1) return [];
  const scored: Array<{ c: Company; score: number }> = [];

  for (const c of all) {
    const sym = normalise(c.sym);
    const name = normalise(c.name);
    let score = -1;

    if (sym === q) score = 0;
    else if (sym.startsWith(q)) score = 1;
    else if (c.name.toLowerCase().split(/\s+/).some((w) => w.startsWith(query.toLowerCase().trim()))) score = 2;
    else if (name.includes(q)) score = 3;
    else if (sym.includes(q)) score = 4;

    if (score >= 0) {
      // Within a tier of relevance, prefer the companies a reader is likelier to
      // mean: index members before the long tail of microcaps.
      scored.push({ c, score: score * 10 + (c.tier === 'broad' ? 0 : c.tier === 'main' ? 1 : 2) });
    }
    if (scored.length > 400) break;
  }

  return scored
    .sort((a, b) => a.score - b.score || a.c.name.length - b.c.name.length)
    .slice(0, limit)
    .map((s) => s.c);
}

// ---------------------------------------------------------------------------
// The API
// ---------------------------------------------------------------------------

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok && res.status !== 409 && res.status !== 429) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function fetchQueue(): Promise<QueueView | null> {
  return getJson<QueueView>('/api/research/requests');
}

/**
 * The kill switch is `research.enabled = 0`, and the API answers 503 when it is
 * closed. The page must render that state rather than a live form that fails on
 * submit: the rollback promise in docs/RESEARCH-REQUESTS.md section 9.1 is that
 * "the page stays up and says the queue is closed".
 */
export type QueueState = { status: 'open' | 'closed' | 'unknown'; view: QueueView | null };

export async function fetchQueueState(): Promise<QueueState> {
  try {
    const res = await fetch('/api/research/requests', { headers: { Accept: 'application/json' } });
    if (res.status === 503) return { status: 'closed', view: null };
    if (!res.ok) return { status: 'unknown', view: null };
    return { status: 'open', view: (await res.json()) as QueueView };
  } catch {
    return { status: 'unknown', view: null };
  }
}

export function fetchVerdict(symbol: string): Promise<Verdict | null> {
  return getJson<Verdict>(`/api/research/resolve?symbol=${encodeURIComponent(symbol)}`);
}

export function fetchNonce(): Promise<string | null> {
  return getJson<{ nonce: string }>('/api/research/nonce').then((d) => d?.nonce ?? null);
}

async function post(url: string, body?: unknown): Promise<{ status: number; data: any }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* an empty or non-JSON body is handled by the status below */
  }
  return { status: res.status, data };
}

export async function submitRequest(
  symbol: string,
  nonce: string,
  note: string,
  honeypot: string
): Promise<SubmitResult> {
  try {
    const { status, data } = await post('/api/research/requests', {
      symbol,
      nonce,
      note: note.trim() || undefined,
      hp: honeypot,
    });
    if (status === 201 || status === 202) {
      return {
        ok: true,
        status: data.status,
        id: data.id,
        name: data.name,
        mode: data.mode,
        message: data.message,
      };
    }
    return {
      ok: false,
      message: data.message || 'That request could not be accepted.',
      covered: data.covered,
      request: data.request,
    };
  } catch {
    return { ok: false, message: 'Could not reach the queue. Try again in a moment.' };
  }
}

export async function voteFor(id: number): Promise<{ ok: boolean; entry?: QueueEntry; message?: string }> {
  try {
    const { status, data } = await post(`/api/research/requests/${id}/vote`);
    if (status === 200) return { ok: true, entry: data.request };
    return { ok: false, entry: data.request, message: data.message || 'That vote was not counted.' };
  } catch {
    return { ok: false, message: 'Could not reach the queue.' };
  }
}
