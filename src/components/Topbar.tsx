'use client';
import { usePathname } from 'next/navigation';
import { useWaaP } from './WaaPProvider';

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
  const { address, logout } = useWaaP();

  return (
    <header className="fixed left-60 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-black/55 px-6 backdrop-blur-glass">
      <h1 className="text-[1.125rem] font-heading font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/65">Execution-first control plane</span>
        {address && (
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        )}
        <button onClick={() => void logout()} className="ui-btn ui-btn-ghost text-xs">
          Logout
        </button>
      </div>
    </header>
  );
}
