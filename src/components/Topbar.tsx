'use client';
import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/home': 'Overview',
  '/agents': 'Agents',
  '/tasks': 'Tasks',
  '/chats': 'Chats',
  '/wallets': 'Wallets',
};

export default function Topbar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'AgentDashboard';

  return (
    <header className="fixed left-60 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-black/55 px-6 backdrop-blur-glass">
      <h1 className="text-[1.125rem] font-heading font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/65">Execution-first control plane</span>
        <div className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 px-3 text-sm font-semibold text-white">
          AM
        </div>
      </div>
    </header>
  );
}
