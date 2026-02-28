'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/home', label: 'Home', icon: '🏠' },
  { href: '/agents', label: 'Agents', icon: '🤖' },
  { href: '/tasks', label: 'Tasks', icon: '📋' },
  { href: '/chats', label: 'Chats', icon: '💬' },
  { href: '/wallets', label: 'Wallets', icon: '🔐' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-white/10 bg-black/65 p-4 backdrop-blur-glass">
      <div className="mb-8 rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">MotusDAO</p>
        <p className="ui-title-gradient mt-1 text-lg font-semibold">AgentDashboard</p>
      </div>

      <nav className="flex flex-1 flex-col gap-2" aria-label="Primary">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="ui-nav-item" data-active={active}>
              <span className="text-base" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ui-surface rounded-md px-3 py-2">
        <p className="flex items-center gap-2 text-xs text-white/70">
          <span className="inline-block h-2 w-2 rounded-full bg-success" />
          AgentMotus · Online
        </p>
      </div>
    </aside>
  );
}
