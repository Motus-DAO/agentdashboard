const STATS = [
  { label: 'Active Agents', value: '4', icon: '🤖' },
  { label: 'Open Tasks', value: '12', icon: '📋' },
  { label: 'Messages Today', value: '47', icon: '💬' },
  { label: 'Wallets', value: '3', icon: '🔐' },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="ui-title-gradient text-3xl font-bold">Overview</h2>
        <p className="mt-2 text-base text-white/70">Live operational metrics for the AgentMotus stack.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <article key={s.label} className="ui-card">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {s.icon}
              </span>
              <span className="ui-title-gradient font-heading text-3xl font-bold">{s.value}</span>
            </div>
            <p className="text-sm text-white/70">{s.label}</p>
          </article>
        ))}
      </section>

      <section className="ui-card">
        <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          <li>
            🟢 <b className="text-white">AgentMotus</b> completed task <code className="font-mono">deploy-landing</code>
          </li>
          <li>
            🔵 <b className="text-white">ResearchAgent</b> started run <code className="font-mono">funding-scan-v2</code>
          </li>
          <li>
            💬 New message in <b className="text-white">#general</b> from Gerry
          </li>
          <li>
            🔐 Wallet <code className="font-mono">0x7a3…f12</code> created by <b className="text-white">Admin</b>
          </li>
        </ul>
      </section>
    </div>
  );
}
