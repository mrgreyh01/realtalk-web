'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { conversations as conversationsApi } from '@/lib/endpoints';
import { createSocket, SOCKET_EVENTS } from '@/lib/socket';
import { useAuth } from './auth-context';

const PAGE_SIZE = 30;
const TYPING_IDLE_MS = 1600;

const ChatContext = createContext(null);

function upsert(list, message) {
  const index = list.findIndex((item) => item.id === message.id);
  if (index === -1) {
    return [...list, message];
  }
  const next = [...list];
  next[index] = { ...next[index], ...message };
  return next;
}

function stampReceipt(list, messageIds, userId, field) {
  const targets = new Set(messageIds);

  return list.map((message) => {
    if (!targets.has(message.id)) {
      return message;
    }

    const patch = {};
    if (field === 'readBy' && !message.readBy?.includes(userId)) {
      patch.readBy = [...(message.readBy || []), userId];
    }
    if (!message.deliveredTo?.includes(userId)) {
      patch.deliveredTo = [...(message.deliveredTo || []), userId];
    }

    return Object.keys(patch).length ? { ...message, ...patch } : message;
  });
}

export function ChatProvider({ children }) {
  const { user } = useAuth();

  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState({});
  const [cursors, setCursors] = useState({});
  const [online, setOnline] = useState([]);
  const [typing, setTyping] = useState({});
  const [connected, setConnected] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const activeIdRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingSentRef = useRef(false);

  activeIdRef.current = activeId;

  const patchThread = useCallback((conversationId, patch) => {
    setThreads((current) =>
      current.map((thread) =>
        thread.id === conversationId
          ? { ...thread, ...(typeof patch === 'function' ? patch(thread) : patch) }
          : thread,
      ),
    );
  }, []);

  const refreshThreads = useCallback(async (signal) => {
    setLoadingThreads(true);
    try {
      const payload = await conversationsApi.list(signal);

      // The list endpoint returns unread counts but not the last line of text,
      // so the preview for each thread comes from a single message lookup.
      const withPreview = await Promise.all(
        payload.data.map(async (thread) => {
          try {
            const page = await conversationsApi.messages(thread.id, { limit: 1, signal });
            const last = page.data[page.data.length - 1];
            return { ...thread, preview: last ? last.body : '' };
          } catch {
            return { ...thread, preview: '' };
          }
        }),
      );

      setThreads(withPreview);
      setError(null);
    } catch (cause) {
      if (cause.name !== 'AbortError') {
        setError(cause.message);
      }
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const controller = new AbortController();
    refreshThreads(controller.signal);
    return () => controller.abort();
  }, [user, refreshThreads]);

  const markRead = useCallback((conversationId) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('message:read', { conversationId });
    } else {
      conversationsApi.markRead(conversationId).catch(() => {});
    }
    patchThread(conversationId, { unreadCount: 0 });
  }, [patchThread]);

  // Socket lifecycle. One connection per signed in user, torn down on logout.
  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (cause) => {
      setConnected(false);
      setError(cause.message === 'Authentication required' ? 'Your session expired.' : null);
    });

    socket.on(SOCKET_EVENTS.presenceSnapshot, ({ onlineUserIds }) => setOnline(onlineUserIds));

    socket.on(SOCKET_EVENTS.presenceChanged, ({ userId, online: isOnline }) => {
      setOnline((current) => {
        const others = current.filter((id) => id !== userId);
        return isOnline ? [...others, userId] : others;
      });
    });

    socket.on(SOCKET_EVENTS.messageNew, (message) => {
      const conversationId = message.conversation;
      const mine = message.sender.id === user.id;

      setMessages((current) => ({
        ...current,
        [conversationId]: upsert(current[conversationId] || [], message),
      }));

      setThreads((current) => {
        const known = current.some((thread) => thread.id === conversationId);
        if (!known) {
          return current;
        }

        return current
          .map((thread) => {
            if (thread.id !== conversationId) {
              return thread;
            }
            const isActive = activeIdRef.current === conversationId;
            return {
              ...thread,
              preview: message.body,
              lastMessageAt: message.createdAt,
              unreadCount: mine || isActive ? 0 : (thread.unreadCount || 0) + 1,
            };
          })
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });

      if (!mine && activeIdRef.current === conversationId) {
        markRead(conversationId);
      }
    });

    socket.on(SOCKET_EVENTS.messageDelivered, ({ conversationId, messageIds, userId }) => {
      setMessages((current) => ({
        ...current,
        [conversationId]: stampReceipt(current[conversationId] || [], messageIds, userId, 'deliveredTo'),
      }));
    });

    socket.on(SOCKET_EVENTS.messageRead, ({ conversationId, messageIds, userId }) => {
      setMessages((current) => ({
        ...current,
        [conversationId]: stampReceipt(current[conversationId] || [], messageIds, userId, 'readBy'),
      }));
    });

    socket.on(SOCKET_EVENTS.typingChanged, ({ conversationId, typing: isTyping }) => {
      setTyping((current) => ({ ...current, [conversationId]: isTyping }));
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setOnline([]);
    };
  }, [user, markRead]);

  const loadMessages = useCallback(async (conversationId) => {
    setLoadingMessages(true);
    try {
      const payload = await conversationsApi.messages(conversationId, { limit: PAGE_SIZE });
      setMessages((current) => ({ ...current, [conversationId]: payload.data }));
      setCursors((current) => ({ ...current, [conversationId]: payload.page.nextCursor }));
      setError(null);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const loadOlder = useCallback(
    async (conversationId) => {
      const cursor = cursors[conversationId];
      if (!cursor) {
        return;
      }

      try {
        const payload = await conversationsApi.messages(conversationId, {
          limit: PAGE_SIZE,
          before: cursor,
        });
        setMessages((current) => ({
          ...current,
          [conversationId]: [...payload.data, ...(current[conversationId] || [])],
        }));
        setCursors((current) => ({ ...current, [conversationId]: payload.page.nextCursor }));
      } catch (cause) {
        setError(cause.message);
      }
    },
    [cursors],
  );

  const selectThread = useCallback(
    async (conversationId) => {
      setActiveId(conversationId);
      activeIdRef.current = conversationId;

      if (!conversationId) {
        return;
      }

      await loadMessages(conversationId);
      markRead(conversationId);
    },
    [loadMessages, markRead],
  );

  const openWithUser = useCallback(
    async (participantId) => {
      try {
        const payload = await conversationsApi.open(participantId);
        const thread = payload.data;

        setThreads((current) => {
          const exists = current.some((item) => item.id === thread.id);
          return exists
            ? current.map((item) => (item.id === thread.id ? { ...item, ...thread } : item))
            : [{ ...thread, preview: '' }, ...current];
        });

        await selectThread(thread.id);
        return thread;
      } catch (cause) {
        setError(cause.message);
        throw cause;
      }
    },
    [selectThread],
  );

  const stopTyping = useCallback(() => {
    const socket = socketRef.current;
    const conversationId = activeIdRef.current;

    clearTimeout(typingTimerRef.current);

    if (socket?.connected && conversationId && typingSentRef.current) {
      socket.emit('typing:stop', { conversationId });
    }
    typingSentRef.current = false;
  }, []);

  /** Fires once when the user starts, then goes quiet until they pause. */
  const notifyTyping = useCallback(() => {
    const socket = socketRef.current;
    const conversationId = activeIdRef.current;
    if (!socket?.connected || !conversationId) {
      return;
    }

    if (!typingSentRef.current) {
      socket.emit('typing:start', { conversationId });
      typingSentRef.current = true;
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  }, [stopTyping]);

  const sendMessage = useCallback(
    async (text) => {
      const conversationId = activeIdRef.current;
      const body = text.trim();
      if (!conversationId || !body || !user) {
        return;
      }

      stopTyping();

      const pendingId = `pending-${Date.now()}`;
      const optimistic = {
        id: pendingId,
        conversation: conversationId,
        sender: { id: user.id, username: user.username, fullName: user.fullName },
        body,
        deliveredTo: [],
        readBy: [user.id],
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((current) => ({
        ...current,
        [conversationId]: [...(current[conversationId] || []), optimistic],
      }));
      patchThread(conversationId, { preview: body, lastMessageAt: optimistic.createdAt });

      const socket = socketRef.current;

      try {
        let saved;

        if (socket?.connected) {
          saved = await new Promise((resolve, reject) => {
            socket.emit('message:send', { conversationId, body }, (ack) => {
              if (ack?.success) {
                resolve(ack.data);
              } else {
                reject(new Error(ack?.message || 'The message was not sent'));
              }
            });
          });
        } else {
          const payload = await conversationsApi.send(conversationId, body);
          saved = payload.data;
        }

        setMessages((current) => {
          const withoutPending = (current[conversationId] || []).filter(
            (message) => message.id !== pendingId,
          );
          return { ...current, [conversationId]: upsert(withoutPending, saved) };
        });
      } catch (cause) {
        setMessages((current) => ({
          ...current,
          [conversationId]: (current[conversationId] || []).map((message) =>
            message.id === pendingId ? { ...message, failed: true, pending: false } : message,
          ),
        }));
        setError(cause.message);
      }
    },
    [user, patchThread, stopTyping],
  );

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeId) || null,
    [threads, activeId],
  );

  const value = useMemo(
    () => ({
      threads,
      activeId,
      activeThread,
      messages: messages[activeId] || [],
      hasOlder: Boolean(cursors[activeId]),
      online,
      isTyping: Boolean(typing[activeId]),
      connected,
      loadingThreads,
      loadingMessages,
      error,
      clearError: () => setError(null),
      refreshThreads,
      selectThread,
      openWithUser,
      sendMessage,
      notifyTyping,
      stopTyping,
      loadOlder,
    }),
    [
      threads,
      activeId,
      activeThread,
      messages,
      cursors,
      online,
      typing,
      connected,
      loadingThreads,
      loadingMessages,
      error,
      refreshThreads,
      selectThread,
      openWithUser,
      sendMessage,
      notifyTyping,
      stopTyping,
      loadOlder,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used inside ChatProvider');
  }
  return context;
}
