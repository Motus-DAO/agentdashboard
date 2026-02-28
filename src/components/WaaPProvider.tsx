'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type WaaPContextType = {
  address: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const WaaPContext = createContext<WaaPContextType>({
  address: null,
  isReady: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

const OWNER_WALLET = (process.env.NEXT_PUBLIC_OWNER_WALLET || '').toLowerCase();

function authMessage(nonce: string) {
  return `AgentDashboard auth nonce: ${nonce}`;
}

async function signWithAvailableWallet(address: string, message: string): Promise<string | null> {
  const waapSignature = await window.waap?.request?.({
    method: 'personal_sign',
    params: [message, address],
  });
  if (typeof waapSignature === 'string' && waapSignature.length > 0) return waapSignature;

  const ethereum = (window as any).ethereum;
  if (ethereum?.request) {
    const sig = await ethereum.request({ method: 'personal_sign', params: [message, address] });
    if (typeof sig === 'string' && sig.length > 0) return sig;
  }

  return null;
}

async function getConnectedAddress(): Promise<string | null> {
  const waapAccounts = await window.waap?.request?.({ method: 'eth_requestAccounts' });
  if (Array.isArray(waapAccounts) && waapAccounts[0]) return String(waapAccounts[0]).toLowerCase();

  const ethereum = (window as any).ethereum;
  if (ethereum?.request) {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (Array.isArray(accounts) && accounts[0]) return String(accounts[0]).toLowerCase();
  }

  return null;
}

async function establishOwnerSession(address: string) {
  const nonceRes = await fetch('/api/auth/nonce', { method: 'GET', cache: 'no-store' });
  if (!nonceRes.ok) return false;

  const { nonce } = (await nonceRes.json()) as { nonce?: string };
  if (!nonce) return false;

  const message = authMessage(nonce);
  const signature = await signWithAvailableWallet(address, message);
  if (!signature) return false;

  const sessionRes = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, signature }),
  });

  return sessionRes.ok;
}

export function useWaaP() {
  return useContext(WaaPContext);
}

export default function WaaPProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const addr = await getConnectedAddress();

        if (!mounted) return;
        if (!addr) {
          setAddress(null);
          return;
        }

        if (OWNER_WALLET && addr !== OWNER_WALLET) {
          setAddress(addr);
          return;
        }

        const check = await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' });
        const hasSession = check.ok && ((await check.json()) as { ok?: boolean }).ok;

        if (!hasSession) {
          const sessionOk = await establishOwnerSession(addr);
          if (!sessionOk) {
            setAddress(null);
            return;
          }
        }

        setAddress(addr);
      } catch {
        if (mounted) setAddress(null);
      } finally {
        if (mounted) setIsReady(true);
      }
    }

    void boot();

    const onAccountsChanged = (accounts: string[]) => {
      const addr = Array.isArray(accounts) ? accounts[0] : null;
      setAddress(addr ? String(addr).toLowerCase() : null);
    };

    window.waap?.on?.('accountsChanged', onAccountsChanged);
    (window as any).ethereum?.on?.('accountsChanged', onAccountsChanged);

    return () => {
      mounted = false;
      window.waap?.removeListener?.('accountsChanged', onAccountsChanged);
      (window as any).ethereum?.removeListener?.('accountsChanged', onAccountsChanged);
    };
  }, []);

  const ctx = useMemo<WaaPContextType>(() => {
    const normalized = (address || '').toLowerCase();
    const isAuthenticated = !!normalized && (!!OWNER_WALLET ? normalized === OWNER_WALLET : true);

    return {
      address,
      isReady,
      isAuthenticated,
      login: async () => {
        await window.waap?.login?.();
        const addr = await getConnectedAddress();

        if (!addr) {
          setAddress(null);
          return;
        }

        if (OWNER_WALLET && addr !== OWNER_WALLET) {
          setAddress(addr);
          return;
        }

        const ok = await establishOwnerSession(addr);
        if (!ok) {
          await window.waap?.logout?.();
          setAddress(null);
          return;
        }

        setAddress(addr);
      },
      logout: async () => {
        await fetch('/api/auth/session', { method: 'DELETE' });
        await window.waap?.logout?.();
        setAddress(null);
      },
    };
  }, [address, isReady]);

  return <WaaPContext.Provider value={ctx}>{children}</WaaPContext.Provider>;
}
