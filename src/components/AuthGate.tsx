'use client';

import { useWaaP } from './WaaPProvider';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated, address, login } = useWaaP();

  if (!isReady) {
    return <div className="ui-card">Checking session…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto mt-12 max-w-lg ui-card">
        <h2 className="text-2xl font-semibold text-white">Owner access required</h2>
        <p className="mt-2 text-sm text-white/70">
          Sign in with the owner wallet to access AgentDashboard.
          {address ? ` Connected wallet: ${address}` : ''}
        </p>
        <button onClick={() => void login()} className="ui-btn ui-btn-primary mt-5">
          Sign in with WaaP
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
