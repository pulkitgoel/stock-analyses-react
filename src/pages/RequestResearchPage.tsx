import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowUpRight, ArrowUp, Check, Clock, Pencil, Search, Sparkles, X,
} from 'lucide-react';
import {
  Company, QueueEntry, QueueView, Verdict,
  fetchNonce, fetchQueueState, fetchVerdict, loadUniverse, searchUniverse,
  submitRequest, voteFor,
} from '../services/researchService';

/**
 * /request-research — nominate a listed company for the research queue.
 *
 * Design: docs/RESEARCH-REQUESTS.md. Three things about this file are
 * deliberate and should survive edits:
 *
 *  1. THE PICKER IS THE SECURITY MODEL (section 0). The submit button is
 *     disabled until a company is chosen from the universe, and what is sent is
 *     that company's id. A reader cannot submit prose, so no prose reaches the
 *     publishing agent. The server re-resolves the id anyway.
 *  2. NO SPINNER OVER PRERENDERED CONTENT (invariant 3.14). Everything above the
 *     queue renders on the first paint from bundled data. The prerender server
 *     does not proxy /api/, so whatever the queue section renders with the fetch
 *     failed is what a crawler reads permanently -- it says the queue appears
 *     here and stops, rather than showing a spinner for ever (section 9.2).
 *  3. ONLY <title> IN THE HELMET (invariant 3.2). The prerendered file owns the
 *     description, canonical, OG and JSON-LD.
 */

const TITLE = 'Request research on a company';

const niceDate = (iso: string) => {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** The stages the backend accepts, in the words a reader sees. */
const minutesSince = (stamp?: string | null) => {
  if (!stamp) return null;
  const iso = String(stamp).includes('T') ? String(stamp) : `${String(stamp).replace(' ', 'T')}Z`;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 60000));
};

const minsLabel = (minutes: number | null) =>
  minutes === null ? '' : minutes <= 0 ? 'under a minute' : `${minutes} min`;

const etaLabel = (seconds?: number) => {
  if (!seconds || seconds < 60) return '';
  const minutes = Math.round(seconds / 60);
  return minutes <= 1 ? '~1 min left' : `~${minutes} min left`;
};

const STAGE_LABEL: Record<string, string> = {
  researching: 'Gathering the data',
  writing: 'Writing the analysis',
  deploying: 'Publishing to the site',
  verifying: 'Checking the live page',
};

const TIER_NOTE: Record<string, string> = {
  main: 'Outside the NIFTY Total Market index — held for review before anything is written.',
  watch: 'NSE trades this on a restricted series — held for review.',
  sme: 'An SME-platform listing — held for review.',
};

function StatusPill({ status }: { status: QueueEntry['status'] | 'approved' }) {
  const map: Record<string, { label: string; fg: string; dot: string; bd: string; bg: string }> = {
    // fg is --accent-warm, not --yellow. In the light theme --yellow is #ca8a04
    // and measured 2.64:1 on its own tint; --accent-warm is #b45309 there and
    // #f6c453 in dark, so one token reads in both. The dot keeps --yellow: it
    // carries no text, so it is decoration and the 4.5 floor does not apply.
    claimed: { label: 'IN PROGRESS', fg: 'var(--accent-warm)', dot: 'var(--yellow)', bd: 'color-mix(in srgb, var(--yellow) 40%, transparent)', bg: 'color-mix(in srgb, var(--yellow) 10%, transparent)' },
    // Approved but not yet picked up. Without this the reader sees QUEUED for the
    // minute or two between the owner's tap and an agent claiming it, which reads
    // as "nothing happened".
    approved: { label: 'APPROVED', fg: 'var(--accent)', dot: 'var(--accent)', bd: 'color-mix(in srgb, var(--accent) 38%, transparent)', bg: 'var(--accent-glow)' },
    queued: { label: 'QUEUED', fg: 'var(--text-muted)', dot: 'var(--text-muted)', bd: 'var(--border-light)', bg: 'var(--surface-soft)' },
    'needs-owner': { label: 'UNDER REVIEW', fg: 'var(--accent-warm)', dot: 'var(--yellow)', bd: 'color-mix(in srgb, var(--yellow) 40%, transparent)', bg: 'color-mix(in srgb, var(--yellow) 10%, transparent)' },
  };
  const s = map[status] ?? map.queued;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0,
      padding: '5px 10px', borderRadius: '999px',
      border: `1px solid ${s.bd}`, background: s.bg,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: s.dot }} />
      <span style={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.05em', color: s.fg }}>
        {s.label}
      </span>
    </span>
  );
}

export default function RequestResearchPage() {
  // Every hook is above every conditional return (invariant 3.12). This page has
  // no early return at all, which is the simplest way to keep that true.
  const [universe, setUniverse] = useState<Company[] | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState<Company | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [nonce, setNonce] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<{ ok: boolean; message: string; held?: boolean } | null>(null);
  const [queue, setQueue] = useState<QueueView | null>(null);
  const [queueAt, setQueueAt] = useState<number>(Date.now());
  const [, setTick] = useState(0);
  const [queueClosed, setQueueClosed] = useState(false);
  const [voted, setVoted] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshQueue = useCallback(() => {
    fetchQueueState().then((state) => {
      setQueueClosed(state.status === 'closed');
      if (state.view) {
        setQueue(state.view);
        setQueueAt(Date.now());
      }
    });
  }, []);

  // The stream pushes state changes only; the estimate counts down locally
  // between them so the number does not freeze for minutes at a time.
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  const etaNow = (entry: QueueEntry) =>
    entry.eta_seconds
      ? Math.max(0, entry.eta_seconds - (Date.now() - queueAt) / 1000)
      : undefined;

  useEffect(() => {
    refreshQueue();
    // The nonce is fetched on mount rather than on submit so it is always older
    // than the three-second floor by the time anyone has finished choosing.
    fetchNonce().then(setNonce);
  }, [refreshQueue]);

  // Progress has to arrive on its own: a stage change that only shows up on a
  // manual refresh is the same as not showing it. The API holds a server-sent
  // event stream open and writes the queue state the moment its signature
  // changes; polling is only the fallback while the stream is down.
  useEffect(() => {
    if (typeof EventSource === 'undefined') {
      const id = window.setInterval(refreshQueue, 5000);
      return () => window.clearInterval(id);
    }
    let fallback: number | undefined;
    const source = new EventSource('/api/research/stream');
    source.onmessage = (event) => {
      try {
        setQueue(JSON.parse(event.data) as QueueView);
        setQueueAt(Date.now());
        setQueueClosed(false);
      } catch {
        // a malformed frame is not worth tearing the stream down for
      }
    };
    source.onopen = () => {
      if (fallback) {
        window.clearInterval(fallback);
        fallback = undefined;
      }
    };
    source.onerror = () => {
      if (!fallback) fallback = window.setInterval(refreshQueue, 5000);
    };
    return () => {
      source.close();
      if (fallback) window.clearInterval(fallback);
    };
  }, [refreshQueue]);

  const results = useMemo(
    () => (universe && query.trim() ? searchUniverse(universe, query.trim()) : []),
    [universe, query]
  );

  const warmUniverse = useCallback(() => {
    if (universe) return;
    // 150 KB, fetched on first focus and never on page load, so it stays off the
    // critical path of a prerendered first paint.
    loadUniverse().then(setUniverse).catch(() => setUniverse([]));
  }, [universe]);

  const choose = useCallback((company: Company) => {
    setPicked(company);
    setQuery(company.name);
    setOpen(false);
    setOutcome(null);
    setVerdict(null);
    setChecking(true);
    fetchVerdict(company.id)
      .then((v) => setVerdict(v))
      .finally(() => setChecking(false));
  }, []);

  const clear = useCallback(() => {
    setPicked(null);
    setQuery('');
    setVerdict(null);
    setOutcome(null);
    setNote('');
    setOpen(false);
    inputRef.current?.focus();
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { setOpen(false); return; }
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      choose(results[Math.min(active, results.length - 1)]);
    }
  };

  const send = async () => {
    if (!picked || !nonce || sending) return;
    setSending(true);
    const result = await submitRequest(picked.id, nonce, note, honeypot);
    setSending(false);
    // Name the company back. "In the queue." on its own, after the form has
    // cleared itself, leaves a reader unsure which request it is talking about.
    setOutcome({
      ok: result.ok,
      message: result.ok && result.name
        ? `${result.name} — ${result.message.charAt(0).toLowerCase()}${result.message.slice(1)}`
        : result.message,
      held: result.status === 'needs-owner',
    });
    if (result.ok) {
      setVerdict(null);
      setPicked(null);
      setQuery('');
      setNote('');
      refreshQueue();
      fetchNonce().then(setNonce);   // a nonce is one use
    } else {
      // A refusal is usually "covered" or "already queued", both of which the
      // verdict panel already knows how to show something useful for.
      fetchVerdict(picked.id).then(setVerdict);
      refreshQueue();
    }
  };

  const castVote = async (id: number) => {
    const result = await voteFor(id);
    setVoted((v) => ({ ...v, [id]: result.ok ? 'counted' : (result.message ?? 'not counted') }));
    if (result.ok) refreshQueue();
  };

  const canSubmit =
    !!picked && !!nonce && !sending && !checking && !queueClosed &&
    (verdict?.state === 'ready' || verdict?.state === 'stale');

  // The label says what the button would do, including when it would do
  // nothing. A disabled control reading "Request research" next to "Covered 5
  // days ago" invites a click that can never work.
  const submitLabel = sending
    ? 'Sending…'
    : queueClosed
      ? 'Queue closed'
      : !picked
      ? 'Select a company'
      : verdict?.state === 'covered'
        ? 'Already covered'
        : verdict?.state === 'queued' || verdict?.state === 'held'
          ? 'Already in the queue'
          : verdict?.state === 'stale'
            ? 'Request an update'
            : 'Request research';

  const limits = queue?.limits;

  return (
    <>
      <Helmet>
        {/* Only the title, and only so the browser tab updates during
            client-side navigation. The description, canonical, OG and JSON-LD
            live in the prerendered file (invariant 3.2). */}
        <title>{TITLE}</title>
      </Helmet>

      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.25rem', alignItems: 'flex-start' }}>

          {/* ---------------------------------------------------- left column */}
          <div style={{ flex: '999 1 520px', minWidth: 0 }}>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '7px 14px', borderRadius: '999px',
              border: '1px solid color-mix(in srgb, var(--accent) 32%, transparent)',
              background: 'var(--accent-glow)',
            }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} aria-hidden="true" />
              <span style={{
                fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
                // Darkened off --accent: the raw token is #0f766e in light, which
                // measures 4.42:1 once --accent-glow tints the ground behind it.
                color: 'color-mix(in srgb, var(--accent) 88%, #000)',
              }}>
                RESEARCH QUEUE
              </span>
            </div>

            <h1 style={{
              margin: '1rem 0 0', fontSize: 'clamp(1.95rem, 5vw, 2.9rem)',
              lineHeight: 1.12, fontWeight: 800, letterSpacing: '-0.025em',
            }}>
              Ask for a company<br />to be <span style={{ color: 'var(--accent)' }}>covered.</span>
            </h1>

            <p style={{ margin: '0.9rem 0 0', fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '46ch' }}>
              Nominate a listed Indian company. If it clears the queue, a full deep dive gets
              published here — and this page is where you watch it happen.
            </p>

            {/* ------------------------------------------------------ picker */}
            <div className="surface-card" style={{ borderRadius: 'var(--radius)', padding: '1.5rem', marginTop: '1.75rem' }}>

              <label htmlFor="company" style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 800,
                letterSpacing: '0.09em', color: 'var(--text-muted)',
              }}>
                COMPANY
              </label>

              <div style={{
                marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '10px',
                height: '52px', padding: '0 14px', borderRadius: '13px',
                border: `1px solid ${picked || open ? 'var(--accent)' : 'var(--border-light)'}`,
                background: 'var(--bg-elevated)',
              }}>
                <Search size={17} style={{ color: 'var(--text-dim)', flexShrink: 0 }} aria-hidden="true" />
                <input
                  id="company"
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={open && results.length > 0}
                  aria-controls="company-options"
                  aria-autocomplete="list"
                  autoComplete="off"
                  placeholder="Start typing a name or ticker"
                  value={query}
                  onFocus={() => { warmUniverse(); if (query) setOpen(true); }}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPicked(null);
                    setVerdict(null);
                    setOutcome(null);
                    setActive(0);
                    setOpen(true);
                  }}
                  onKeyDown={onKeyDown}
                  style={{
                    flex: 1, minWidth: 0, height: '100%', border: 0, outline: 0,
                    background: 'transparent', color: 'var(--text)',
                    fontFamily: 'inherit', fontSize: '1rem', fontWeight: 500,
                  }}
                />
                {picked && (
                  <button type="button" onClick={clear} aria-label="Clear the selected company"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', flexShrink: 0, cursor: 'pointer',
                      borderRadius: '999px', border: '1px solid var(--border)',
                      background: 'var(--surface-soft)', color: 'var(--text-muted)',
                    }}>
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>

              {open && results.length > 0 && (
                <ul id="company-options" role="listbox" aria-label="Matching companies"
                  style={{
                    listStyle: 'none', margin: '0.5rem 0 0', padding: 0,
                    border: '1px solid var(--border-light)', borderRadius: '13px',
                    background: 'var(--bg-elevated)', overflow: 'hidden',
                  }}>
                  {results.map((c, i) => (
                    <li key={c.id} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => choose(c)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: '12px', width: '100%', minHeight: '56px', padding: '0.8rem 0.9rem',
                          textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                          border: 0, borderTop: i ? '1px solid var(--border)' : 0,
                          borderLeft: `3px solid ${i === active ? 'var(--accent)' : 'transparent'}`,
                          background: i === active ? 'var(--bg-card-hover)' : 'transparent',
                          color: 'var(--text)',
                        }}
                      >
                        <span style={{ minWidth: 0 }}>
                          <span style={{
                            display: 'block', fontSize: '0.92rem', fontWeight: 600,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {c.name}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                            {c.industry || (c.market === 'NASDAQ' ? 'NASDAQ listed'
                              : c.market === 'NYSE' ? 'NYSE listed'
                                : c.market === 'AMEX' ? 'NYSE American'
                                  : c.tier === 'sme' ? 'SME platform' : 'NSE listed')}
                          </span>
                        </span>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', flexShrink: 0,
                          color: i === active ? 'var(--accent)' : 'var(--text-muted)',
                        }}>
                          {c.sym}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {open && query.trim().length > 1 && universe && results.length === 0 && (
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No listed Indian company matches that. Indian equities only for now.
                </p>
              )}

              {/* ------------------------------------------------- the verdict */}
              {checking && (
                <p style={{ margin: '0.9rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Checking what has already been published…
                </p>
              )}

              {!checking && verdict && picked && (
                <div style={{ marginTop: '0.9rem' }}>
                  {verdict.state === 'covered' && verdict.covered && (
                    <div style={{
                      border: '1px solid var(--border-light)', borderLeft: '3px solid var(--accent)',
                      borderRadius: '12px', background: 'var(--bg-elevated)', padding: '0.85rem 0.9rem',
                    }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{verdict.message}</div>
                      <Link to={`/analysis/${verdict.covered.slug}`} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '10px', marginTop: '0.55rem', fontSize: '0.85rem', fontWeight: 600,
                        color: 'var(--accent)', textDecoration: 'none',
                      }}>
                        <span>{verdict.covered.title}</span>
                        <ArrowUpRight size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
                      </Link>
                    </div>
                  )}

                  {verdict.state === 'stale' && verdict.covered && (
                    <div style={{
                      border: '1px solid var(--border-light)', borderRadius: '12px',
                      background: 'var(--bg-elevated)', padding: '0.85rem 0.9rem',
                    }}>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Last covered <strong style={{ color: 'var(--text)' }}>{niceDate(verdict.covered.date)}</strong>.
                        An update extends that note rather than replacing it.
                      </div>
                      <Link to={`/analysis/${verdict.covered.slug}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        marginTop: '0.45rem', fontSize: '0.82rem', fontWeight: 600,
                        color: 'var(--accent)', textDecoration: 'none',
                      }}>
                        Read the existing note <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  )}

                  {(verdict.state === 'queued' || verdict.state === 'held') && verdict.request && (
                    <div style={{
                      border: '1px solid var(--border-light)', borderRadius: '12px',
                      background: 'var(--bg-elevated)', padding: '0.85rem 0.9rem',
                    }}>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{verdict.message}</div>
                      {verdict.state === 'queued' && (
                        <button type="button" className="btn" onClick={() => castVote(verdict.request!.id)}
                          disabled={!!voted[verdict.request.id]}
                          style={{
                            marginTop: '0.7rem', width: '100%',
                            border: '1px solid var(--accent)', background: 'var(--accent-glow)',
                            color: 'var(--accent)',
                          }}>
                          <ArrowUp size={16} aria-hidden="true" />
                          {voted[verdict.request.id] === 'counted' ? 'Vote counted' : 'Add my vote'}
                        </button>
                      )}
                      {voted[verdict.request.id] && voted[verdict.request.id] !== 'counted' && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {voted[verdict.request.id]}
                        </p>
                      )}
                    </div>
                  )}

                  {verdict.state === 'ready' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      <Check size={17} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
                      <span>Never covered here. Ready to queue.</span>
                    </div>
                  )}

                  {picked.tier !== 'broad' && verdict.state !== 'covered' && (
                    <p style={{
                      margin: '0.7rem 0 0', fontSize: '0.78rem', color: 'var(--yellow)',
                      display: 'flex', gap: '8px', alignItems: 'flex-start',
                    }}>
                      <Clock size={14} style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                      <span>{TIER_NOTE[picked.tier]}</span>
                    </p>
                  )}
                </div>
              )}

              {/* optional note — stored for the owner, never sent to a model */}
              {picked && (verdict?.state === 'ready' || verdict?.state === 'stale') && (
                <div style={{ marginTop: '0.9rem' }}>
                  <label htmlFor="note" style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.09em',
                    color: 'var(--text-muted)',
                  }}>
                    <Pencil size={12} aria-hidden="true" />
                    ANYTHING WE SHOULD LOOK AT? (OPTIONAL)
                  </label>
                  <input
                    id="note"
                    type="text"
                    maxLength={200}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. the Q2 margin jump"
                    style={{
                      marginTop: '0.45rem', width: '100%', height: '46px', padding: '0 13px',
                      borderRadius: '12px', border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', color: 'var(--text)',
                      fontFamily: 'inherit', fontSize: '0.9rem', outline: 0,
                    }}
                  />
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Read by a person, not by the writing process.
                  </p>
                </div>
              )}

              {/* The honeypot. Hidden from people and from screen readers; a bot
                  that fills every field in the form gets the request dropped. */}
              <input
                type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
                name="company_website" value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{
                  position: 'absolute', width: '1px', height: '1px',
                  padding: 0, margin: '-1px', overflow: 'hidden', border: 0,
                  clipPath: 'inset(50%)', whiteSpace: 'nowrap',
                }}
              />

              {queueClosed && (
                <div role="status" style={{
                  marginTop: '1rem', borderRadius: '12px', padding: '0.85rem 0.95rem',
                  border: '1px solid var(--border-light)', background: 'var(--bg-elevated)',
                }}>
                  <div style={{ fontSize: '0.87rem', fontWeight: 700 }}>
                    The research queue is closed right now.
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    New requests and votes are paused. This page will show the queue again when it
                    reopens — nothing you have already submitted is lost.
                  </div>
                </div>
              )}

              <button type="button" className={canSubmit ? 'btn btn-primary' : 'btn'}
                onClick={send} disabled={!canSubmit}
                style={{
                  marginTop: '1rem', width: '100%',
                  ...(canSubmit ? {} : {
                    border: '1px solid var(--border)',
                    background: 'var(--surface-soft)',
                    color: 'var(--text-muted)',
                  }),
                }}>
                {submitLabel}
              </button>

              {outcome && (
                <div role="status" style={{
                  marginTop: '0.8rem', borderRadius: '12px', padding: '0.8rem 0.9rem',
                  border: `1px solid ${outcome.ok
                    ? (outcome.held ? 'color-mix(in srgb, var(--yellow) 42%, transparent)' : 'color-mix(in srgb, var(--accent) 38%, transparent)')
                    : 'var(--border-light)'}`,
                  background: outcome.ok && !outcome.held ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                }}>
                  <div style={{ fontSize: '0.87rem', fontWeight: 600 }}>{outcome.message}</div>
                </div>
              )}

              {limits && (
                <p style={{ margin: '0.7rem 0 0', fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {limits.accepted_per_day} accepted a day · {limits.max_open - limits.open} of {limits.max_open} slots open
                </p>
              )}

              <p style={{
                margin: '0.9rem 0 0', paddingTop: '0.85rem', borderTop: '1px solid var(--border)',
                fontSize: '0.76rem', color: 'var(--text-muted)',
              }}>
                Pick a company from the list. Typed text on its own is not submitted — the queue
                only accepts listed companies.
              </p>
            </div>

            <div className="surface-plain" style={{
              marginTop: '1.25rem', borderRadius: '14px', padding: '0.95rem 1.15rem',
              borderLeft: '3px solid var(--border-light)',
            }}>
              <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                Not every request is accepted, and a smaller or less liquid company is held for
                review before anything is written about it. Published research is educational and
                is not investment advice. <Link to="/disclaimer" style={{ color: 'var(--accent)' }}>
                  Read the full disclaimer
                </Link>
              </p>
            </div>
          </div>

          {/* --------------------------------------------------- right column */}
          <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <section className="surface-card" style={{ borderRadius: 'var(--radius)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>In the queue</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>by votes</span>
              </div>

              {/* No spinner here, ever. This is the state a crawler reads. */}
              {!queue && (
                <p style={{ margin: '0.9rem 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  The live queue appears here.
                </p>
              )}

              {queue && queue.open.length === 0 && (
                <p style={{ margin: '0.9rem 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Nothing is queued right now. Yours would be first.
                </p>
              )}

              {queue && queue.open.length > 0 && (
                <ul style={{ listStyle: 'none', margin: '0.9rem 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {queue.open.map((entry, i) => (
                    <li key={entry.id} style={{
                      paddingBottom: i === queue.open.length - 1 ? 0 : '0.9rem',
                      borderBottom: i === queue.open.length - 1 ? 0 : '1px solid var(--border)',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.07em', color: 'var(--accent)' }}>
                          {entry.symbol.replace('NSE:', '')}
                        </div>
                        <div style={{ marginTop: '2px', fontSize: '0.9rem', fontWeight: 600 }}>{entry.name}</div>
                        <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                          <StatusPill status={entry.status === 'queued' && entry.approved_at ? 'approved' : entry.status} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {entry.status === 'claimed'
                              ? (entry.stage ? STAGE_LABEL[entry.stage] ?? 'Working on it' : 'Working on it')
                              : `asked ${niceDate(entry.created_at)}`}
                          </span>
                          {etaNow(entry) ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>
                              {etaLabel(etaNow(entry))}
                            </span>
                          ) : null}
                        </div>
                        {entry.status === 'claimed' && (
                          <div style={{ marginTop: '3px', fontSize: '0.68rem', color: 'var(--text-muted)', opacity: 0.85 }}>
                            {[
                              minutesSince(entry.first_claimed_at ?? entry.claimed_at) !== null
                                ? `${minsLabel(minutesSince(entry.claimed_at))} elapsed`
                                : '',
                              entry.stage && minutesSince(entry.stage_at) !== null
                                ? `${minsLabel(minutesSince(entry.stage_at))} in this step`
                                : '',
                            ].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </div>
                      <button type="button"
                        onClick={() => castVote(entry.id)}
                        disabled={!!voted[entry.id]}
                        aria-label={`Add a vote for ${entry.name}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0,
                          minHeight: '34px', padding: '0 11px', borderRadius: '999px',
                          border: '1px solid var(--border-light)', background: 'var(--surface-soft)',
                          color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.78rem',
                          fontWeight: 600, cursor: voted[entry.id] ? 'default' : 'pointer',
                          opacity: voted[entry.id] ? 0.65 : 1,
                        }}>
                        <ArrowUp size={13} style={{ color: 'var(--accent)' }} aria-hidden="true" />
                        {entry.votes}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {queue && queue.recent.length > 0 && (
              <section className="surface-card" style={{ borderRadius: 'var(--radius)', padding: '1.25rem' }}>
                <h2 style={{ margin: '0 0 0.9rem', fontSize: '1rem', fontWeight: 700 }}>
                  Published from requests
                </h2>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {queue.recent.map((entry, i) => (
                    <li key={entry.id} style={{
                      paddingTop: i ? '0.8rem' : 0,
                      borderTop: i ? '1px solid var(--border)' : 0,
                      paddingBottom: i === queue.recent.length - 1 ? 0 : '0.8rem',
                    }}>
                      <Link to={`/analysis/${entry.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                        <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>
                          {entry.name}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          asked {niceDate(entry.created_at)} · published {niceDate(entry.published_at ?? entry.created_at)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
