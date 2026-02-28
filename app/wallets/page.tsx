const WALLETS = [
  { address: '0x7a3…f12', label: 'Treasury', provider: 'Human.tech', balance: '2.4 SOL', permissions: 'Owner + Admin' },
  { address: '0x1b9…a03', label: 'Operations', provider: 'AA Service', balance: '0.8 SOL', permissions: 'Admin + Operator' },
  { address: '0x4e2…d77', label: 'Agent Wallet', provider: 'AA Service', balance: '0.1 SOL', permissions: 'Operator (execute)' },
];

const ACTIVITY = [
  { action: 'Wallet created', wallet: 'Agent Wallet', by: 'Admin', time: '1h ago' },
  { action: 'Permission granted', wallet: 'Operations', by: 'Owner', time: '3h ago' },
  { action: 'Transfer approved', wallet: 'Treasury', by: 'Owner + Admin', time: '1d ago' },
];

export default function WalletsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Wallets</h2>
        <button className="ui-btn ui-btn-primary">+ Create Wallet</button>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {WALLETS.map((w) => (
          <article key={w.address} className="ui-card">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-white">{w.label}</span>
              <span className="font-mono text-xs text-white/70">{w.address}</span>
            </div>
            <p className="ui-title-gradient font-heading text-3xl font-bold">{w.balance}</p>
            <p className="mt-1 text-sm text-white/70">Provider: {w.provider}</p>
            <p className="text-sm text-white/70">Permissions: {w.permissions}</p>
          </article>
        ))}
      </section>

      <section className="ui-card">
        <h3 className="text-xl font-semibold text-white">Recent Wallet Activity</h3>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          {ACTIVITY.map((a, i) => (
            <li key={i}>
              <b className="text-white">{a.action}</b> on <code className="font-mono">{a.wallet}</code> by {a.by} — {a.time}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
