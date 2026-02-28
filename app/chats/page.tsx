'use client';

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {
  AGENT_AREAS,
  DEFAULT_AGENT_AREA,
  getSubAreasForArea,
  type AgentArea,
  type AgentSubArea,
} from '@/src/lib/agentAreas';

type Chat = {
  _id: string;
  title: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  agent?: { name: string; area?: string; subArea?: string };
};

type Msg = {
  _id: string;
  authorType: 'human' | 'agent';
  authorId: string;
  content: string;
  createdAt: string;
};

type ModelChoice = 'codex' | 'opus';

type ApiErrorPayload = {
  error?: string | { code?: string; message?: string; retryable?: boolean; details?: unknown };
};

function timeLabel(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 65000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function extractServerError(payload: ApiErrorPayload | null, fallback = 'Unknown server error') {
  if (!payload?.error) return fallback;
  if (typeof payload.error === 'string') return payload.error;
  return payload.error.message || payload.error.code || fallback;
}

function ChatsPageInner() {
  const searchParams = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [model, setModel] = useState<ModelChoice>('codex');
  const [streamingText, setStreamingText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [newChatArea, setNewChatArea] = useState<AgentArea>(DEFAULT_AGENT_AREA);
  const [newChatSubArea, setNewChatSubArea] = useState<AgentSubArea | ''>('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const subAreaOptions = useMemo(() => getSubAreasForArea(newChatArea), [newChatArea]);

  const createChatPayload = useMemo(
    () => ({
      title: `Chat ${chats.length + 1}`,
      area: newChatArea,
      ...(subAreaOptions.includes(newChatSubArea as AgentSubArea) && newChatSubArea
        ? { subArea: newChatSubArea as AgentSubArea }
        : {}),
    }),
    [chats.length, newChatArea, newChatSubArea, subAreaOptions]
  );

  const loadState = async (chatId?: string | null) => {
    const query = chatId ? `?chatId=${encodeURIComponent(chatId)}` : '';
    try {
      const res = await fetch(`/api/chat/state${query}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        let text = '';
        try {
          const payload = (await res.json()) as ApiErrorPayload;
          text = extractServerError(payload);
        } catch {
          text = await res.text();
        }
        setStatusMessage(`⚠️ No se pudo actualizar el estado (${res.status}): ${text || 'intenta de nuevo'}`);
        return;
      }
      const data = await res.json();
      setChats(data.chats || []);
      setMessages(data.messages || []);
    } catch {
      setStatusMessage('⚠️ Falló la actualización del chat. Revisa tu conexión.');
    }
  };

  useEffect(() => {
    const savedModel = localStorage.getItem('agentdashboard:model') as ModelChoice | null;
    if (savedModel === 'codex' || savedModel === 'opus') setModel(savedModel);
  }, []);

  useEffect(() => {
    const chatIdFromUrl = searchParams.get('chatId')?.trim();
    if (chatIdFromUrl) setSelectedChatId(chatIdFromUrl);
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('agentdashboard:model', model);
  }, [model]);

  useEffect(() => {
    void loadState(selectedChatId);
    const id = setInterval(() => {
      if (!streamingText) void loadState(selectedChatId);
    }, 2500);
    return () => clearInterval(id);
  }, [selectedChatId, streamingText]);

  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0]._id);
      return;
    }

    if (selectedChatId && chats.length > 0 && !chats.some((c) => c._id === selectedChatId)) {
      setSelectedChatId(chats[0]._id);
      setStatusMessage('ℹ️ El chat seleccionado ya no existe. Se abrió el chat más reciente.');
    }
  }, [chats, selectedChatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamingText]);

  const selectedChat = useMemo(() => chats.find((c) => c._id === selectedChatId), [chats, selectedChatId]);

  async function handleCreateChat() {
    const res = await fetch('/api/chat/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createChatPayload),
    });
    if (!res.ok) {
      setStatusMessage('❌ No se pudo crear el chat.');
      return;
    }
    const data = await res.json();
    setSelectedChatId(data.chatId);
    await loadState(data.chatId);
  }

  async function animateAssistantReply(text: string) {
    setStreamingText('');
    for (let i = 1; i <= text.length; i++) {
      setStreamingText(text.slice(0, i));
      await sleep(8);
    }
    await sleep(120);
    setStreamingText('');
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    let chatId = selectedChatId;
    if (!chatId) {
      const createRes = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Chat',
          area: newChatArea,
          ...(subAreaOptions.includes(newChatSubArea as AgentSubArea) && newChatSubArea
            ? { subArea: newChatSubArea as AgentSubArea }
            : {}),
        }),
      });
      if (!createRes.ok) {
        setStatusMessage('❌ No se pudo crear un chat para enviar el mensaje.');
        return;
      }
      const created = await createRes.json();
      chatId = created.chatId;
      setSelectedChatId(chatId);
    }

    setSending(true);
    setStatusMessage('⏳ Enviando al agente...');
    const message = draft.trim();
    setDraft('');

    try {
      const res = await fetchWithTimeout(
        '/api/chat/respond',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, message, model }),
        },
        30000
      );

      if (!res.ok) {
        let payload: ApiErrorPayload | null = null;
        try {
          payload = (await res.json()) as ApiErrorPayload;
        } catch {
          payload = null;
        }

        const serverError = extractServerError(payload, 'Intenta de nuevo.');
        const code = typeof payload?.error === 'object' ? payload.error?.code : undefined;

        if (code === 'CHAT_NOT_FOUND') {
          setStatusMessage(`❌ ${serverError} Crea/selecciona otro chat y reintenta.`);
          setSelectedChatId(null);
          await loadState(null);
        } else if (res.status === 502 && (serverError.includes('fetch failed') || serverError.toLowerCase().includes('bridge'))) {
          setStatusMessage('❌ El agente no está alcanzable (bridge/túnel). Comprueba que OPENCLAW_BRIDGE_URL esté activo y el túnel corriendo.');
          await loadState(chatId);
        } else {
          setStatusMessage(`❌ Error del servidor (${res.status}): ${serverError}`);
          await loadState(chatId);
        }
        return;
      }

      const data = await res.json();
      const reply = data?.reply || '';

      setStatusMessage('🔄 Actualizando estado del chat...');
      await loadState(chatId);

      if (reply) {
        setStatusMessage('✍️ Renderizando respuesta...');
        await animateAssistantReply(reply);
      }

      await loadState(chatId);
      setStatusMessage('');
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      setStatusMessage(
        isAbort
          ? '⏱️ Timeout esperando al backend (30s). Revisa Convex/bridge y vuelve a intentar.'
          : '❌ Falló la solicitud. Revisa conexión o configuración del bridge.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      <aside className="ui-surface w-80 flex-shrink-0 overflow-y-auto">
        <div className="space-y-3 border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Threads</h3>
            <button onClick={handleCreateChat} className="ui-btn ui-btn-primary text-xs">
              + New
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="mb-0.5 block text-white/60">Area</label>
              <select
                value={newChatArea}
                onChange={(e) => {
                  const a = e.target.value as AgentArea;
                  setNewChatArea(a);
                  setNewChatSubArea('');
                }}
                className="ui-input"
              >
                {AGENT_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-white/60">Sub-area</label>
              <select
                value={newChatSubArea}
                onChange={(e) => setNewChatSubArea(e.target.value as AgentSubArea | '')}
                className="ui-input"
                disabled={subAreaOptions.length === 0}
              >
                <option value="">—</option>
                {subAreaOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {chats.map((t) => (
          <button
            key={t._id}
            onClick={() => setSelectedChatId(t._id)}
            className={`w-full border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] ${
              selectedChatId === t._id ? 'bg-white/[0.04]' : ''
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="truncate text-sm font-medium text-white">{t.title}</span>
            </div>
            {t.agent && (
              <p className="mb-0.5 text-[10px] text-white/55">
                {t.agent.name}
                {(t.agent.area || t.agent.subArea) && ` · ${[t.agent.area, t.agent.subArea].filter(Boolean).join(' → ')}`}
              </p>
            )}
            <p className="truncate text-xs text-white/70">{t.lastMessage || 'No messages yet'}</p>
            <p className="mt-0.5 text-[10px] text-white/45">{timeLabel(t.lastMessageAt || t.updatedAt)}</p>
          </button>
        ))}

        {chats.length === 0 && <p className="p-4 text-xs text-white/55">No chats yet. Create one.</p>}
      </aside>

      <section className="ui-surface flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{selectedChat?.title || 'Select a chat'}</h3>
            {selectedChat?.agent && (
              <p className="mt-0.5 text-xs text-white/60">
                {selectedChat.agent.name}
                {(selectedChat.agent.area || selectedChat.agent.subArea) &&
                  ` · ${[selectedChat.agent.area, selectedChat.agent.subArea].filter(Boolean).join(' → ')}`}
              </p>
            )}
            {statusMessage && <p className="mt-1 truncate text-[11px] text-amber-300">{statusMessage}</p>}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/60">Model:</span>
            <select value={model} onChange={(e) => setModel(e.target.value as ModelChoice)} className="ui-input">
              <option value="codex">Codex</option>
              <option value="opus">Opus</option>
            </select>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m._id} className={`flex flex-col ${m.authorType === 'agent' ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm ${
                  m.authorType === 'agent' ? 'bg-[rgba(147,51,234,0.18)] text-white' : 'bg-white/10 text-white'
                }`}
              >
                <p className="mb-1 text-xs font-medium text-white/60">
                  {m.authorId} · {timeLabel(m.createdAt)}
                </p>
                {m.authorType === 'agent' ? (
                  <div className="chat-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                )}
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex flex-col items-start">
              <div className="max-w-[70%] rounded-xl bg-[rgba(147,51,234,0.18)] px-4 py-2.5 text-sm text-white">
                <p className="mb-1 text-xs font-medium text-white/60">AgentMotus · now</p>
                <div className="chat-markdown whitespace-pre-wrap">{streamingText}</div>
              </div>
            </div>
          )}

          {messages.length === 0 && selectedChatId && (
            <p className="text-sm text-white/60">No messages yet. Send the first one.</p>
          )}
        </div>

        <form onSubmit={handleSend} className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="ui-input"
            />
            <button type="submit" disabled={sending} className="ui-btn ui-btn-primary disabled:opacity-50">
              {sending ? 'Thinking…' : 'Send'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<div className="ui-card">Loading chats…</div>}>
      <ChatsPageInner />
    </Suspense>
  );
}
