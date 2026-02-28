const TASKS = [
  { id: 'T-001', title: 'Deploy landing-A to production', status: 'in_progress', priority: 'high', agent: 'DevAgent' },
  { id: 'T-002', title: 'Scan Aleo grant program', status: 'todo', priority: 'medium', agent: 'ResearchAgent' },
  { id: 'T-003', title: 'Generate token launch threads', status: 'done', priority: 'high', agent: 'AgentMotus' },
  { id: 'T-004', title: 'Audit wallet permissions model', status: 'todo', priority: 'low', agent: '—' },
  { id: 'T-005', title: 'Set up Convex production env', status: 'in_progress', priority: 'medium', agent: 'DevAgent' },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  todo: { bg: 'rgba(99, 102, 241, 0.15)', text: 'var(--brand-blue)' },
  in_progress: { bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--warning)' },
  done: { bg: 'rgba(34, 197, 94, 0.15)', text: 'var(--success)' },
};

const PRIORITY_STYLE: Record<string, string> = {
  high: 'var(--error)',
  medium: 'var(--warning)',
  low: 'var(--text-muted)',
};

export default function TasksPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Tasks</h2>
        <button className="ui-btn ui-btn-primary">+ New Task</button>
      </div>
      <div className="ui-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/60">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Agent</th>
            </tr>
          </thead>
          <tbody>
            {TASKS.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-mono text-xs text-white/65">{t.id}</td>
                <td className="px-5 py-3 text-white">{t.title}</td>
                <td className="px-5 py-3">
                  <span className="ui-badge" style={{ background: STATUS_STYLE[t.status].bg, color: STATUS_STYLE[t.status].text }}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs font-medium" style={{ color: PRIORITY_STYLE[t.priority] }}>
                  {t.priority}
                </td>
                <td className="px-5 py-3 text-white/70">{t.agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
