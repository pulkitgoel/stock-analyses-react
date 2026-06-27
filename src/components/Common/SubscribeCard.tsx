import { Bell, BellRing, Loader2, Sparkles } from 'lucide-react';

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
      <div className="subscribe-panel surface-card rounded-[1.75rem]">
        <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>Push notifications unavailable</h2>
        <p className="mt-2 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
          This browser does not support push alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="subscribe-panel premium-card surface-card rounded-[1.75rem]">
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            {subscribed ? <BellRing size={22} /> : <Sparkles size={22} />}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              {subscribed ? 'Research alerts are on' : 'Never miss a fresh note'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              Get a browser alert when a new deep-dive, market note, or institutional tracker is published.
            </p>
          </div>
        </div>
        <button
          onClick={subscribed ? onUnsubscribe : onSubscribe}
          disabled={loading}
          className={`btn ${subscribed ? 'btn-success' : 'btn-primary'}`}
          style={{ width: '100%', maxWidth: '200px' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : subscribed ? <BellRing size={16} /> : <Bell size={16} />}
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
}
