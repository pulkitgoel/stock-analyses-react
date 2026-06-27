export default function PrivacyPage() {
  return (
    <div className="max-w-[700px]">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-8" style={{ color: 'var(--text)' }}>Privacy</h1>
      <div className="space-y-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        <p>
          <strong style={{ color: 'var(--text)' }}>We respect your privacy.</strong> This site does not collect, store, or share any personal information beyond what is necessary for push notification functionality.
        </p>

        <h2 className="text-sm sm:text-base font-semibold mt-6 mb-2" style={{ color: 'var(--text)' }}>🔔 Push Notifications</h2>
        <p>
          If you subscribe, your browser's push endpoint is stored solely to send you notifications when new analyses are published. You can unsubscribe at any time — this removes your data from our server.
        </p>

        <h2 className="text-sm sm:text-base font-semibold mt-6 mb-2" style={{ color: 'var(--text)' }}>📊 Analytics</h2>
        <p>
          This site does not use Google Analytics, trackers, or cookies. No visitor data is collected.
        </p>

        <h2 className="text-sm sm:text-base font-semibold mt-6 mb-2" style={{ color: 'var(--text)' }}>🔗 External Links</h2>
        <p>
          Some pages may link to external sites (NSE, BSE, Screener, TradingView). We are not responsible for their privacy practices.
        </p>

        <h2 className="text-sm sm:text-base font-semibold mt-6 mb-2" style={{ color: 'var(--text)' }}>📧 Contact</h2>
        <p>
          For privacy concerns: <a href="mailto:pulkitgoel28@gmail.com" style={{ color: 'var(--accent)' }}>pulkitgoel28@gmail.com</a>
        </p>

        <p className="pt-4 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-dim)' }}>
          Last updated: June 2026
        </p>
      </div>
    </div>
  );
}
