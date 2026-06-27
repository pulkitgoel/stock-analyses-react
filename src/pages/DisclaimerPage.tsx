export default function DisclaimerPage() {
  return (
    <div className="max-w-[700px]">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-8" style={{ color: 'var(--text)' }}>Disclaimer</h1>
      <div className="space-y-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        <p>
          <strong style={{ color: 'var(--text)' }}>Not Financial Advice.</strong> The content on this site is for <strong style={{ color: 'var(--text)' }}>educational and informational purposes only</strong>. It does not constitute investment advice or a recommendation to buy or sell any security.
        </p>
        <p>
          All analyses are based on publicly available data (NSE, BSE, Screener, company filings) and the author's personal research. <strong style={{ color: 'var(--text)' }}>Past performance is not indicative of future results.</strong>
        </p>
        <p>
          Investing in stocks carries inherent risk. You may lose some or all of your capital. Always do your own due diligence (DYODD) before making any investment decision.
        </p>
        <p>
          The author may hold positions in stocks discussed on this site. No guarantee is made regarding the accuracy or timeliness of the information presented.
        </p>
        <p className="pt-4 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-dim)' }}>
          By using this website, you agree that the author is not liable for any losses or damages arising from the use of this information.
        </p>
      </div>
    </div>
  );
}
