import { Bell, BellRing, Loader2 } from 'lucide-react';

interface SubscribeCardProps {
  subscribed: boolean;
  supported: boolean;
  loading: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}

export default function SubscribeCard({ subscribed, supported, loading, onSubscribe, onUnsubscribe }: SubscribeCardProps) {
  if (!supported) {
    return (
      <div className="mt-8 sm:mt-12 p-3.5 sm:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <span className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
          🔔 <span style={{ color: 'var(--text)' }}>Push notifications</span> not available in this browser.
        </span>
        <button disabled className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed"
          style={{ background: 'var(--text-dim)', color: '#fff', opacity: 0.4 }}>
          Unavailable
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-12 p-3.5 sm:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <span className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        🔔 <span style={{ color: 'var(--text)' }}>Get notified</span> when new analyses drop.
      </span>
      <button
        onClick={subscribed ? onUnsubscribe : onSubscribe}
        disabled={loading}
        className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all border-none"
        style={{
          background: subscribed ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
          color: subscribed ? 'var(--green)' : 'var(--accent)',
          border: subscribed ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(59,130,246,0.25)',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <Loader2 size={13} className="inline animate-spin mr-1" />
        ) : subscribed ? (
          <><BellRing size={13} className="inline mr-1" /> Subscribed</>
        ) : (
          <><Bell size={13} className="inline mr-1" /> Subscribe</>
        )}
      </button>
    </div>
  );
}
