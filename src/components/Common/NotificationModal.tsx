import { useState } from 'react';
import { X, Bell, Mail, Send, CheckCircle } from 'lucide-react';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationModal({ open, onClose }: NotificationModalProps) {
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In production, send to backend
      setSuccess(true);
      setTimeout(onClose, 2000);
    }
  };

  const handleTelegramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (telegram) {
      setSuccess(true);
      setTimeout(onClose, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="relative w-full max-w-md rounded-xl p-5 sm:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-md transition-colors cursor-pointer border-none"
          style={{ color: 'var(--text-dim)' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--text)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
          <X size={16} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="mx-auto mb-3 text-green-500" />
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>You're subscribed!</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You'll get flash alerts on new analyses.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} style={{ color: 'var(--accent)' }} />
              <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Flash Alerts</h3>
            </div>
            <p className="text-xs sm:text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Get notified when new deep-dive analyses drop.
            </p>

            {/* Email */}
            <form onSubmit={handleEmailSubmit} className="mb-3">
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-dim)' }}>
                <Mail size={12} className="inline mr-1" /> Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button type="submit" className="px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-opacity"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  <Send size={14} />
                </button>
              </div>
            </form>

            {/* Telegram */}
            <form onSubmit={handleTelegramSubmit}>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-dim)' }}>
                <Send size={12} className="inline mr-1" /> Telegram
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                  className="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button type="submit" className="px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-opacity"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  <Send size={14} />
                </button>
              </div>
            </form>

            <button onClick={onClose} className="mt-4 text-xs cursor-pointer border-none bg-transparent"
              style={{ color: 'var(--text-dim)' }}>
              No thanks
            </button>
          </>
        )}
      </div>
    </div>
  );
}
