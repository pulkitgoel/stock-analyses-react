export default function HeroSection() {
  return (
    <div className="mb-6 sm:mb-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-1.5">
        Deep-Dive{' '}
        <span className="bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
          Stock Research
        </span>
      </h1>
      <p className="text-sm sm:text-base leading-relaxed max-w-xl" style={{ color: 'var(--text-muted)' }}>
        Fundamental analysis of Indian stocks with NSE delivery data, promoter trends, quarterly results, and actionable insights — by Pulkit.
      </p>
    </div>
  );
}
