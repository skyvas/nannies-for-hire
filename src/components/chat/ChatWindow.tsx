'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, CheckCheck, Sparkles, X, MessageSquare, AlertCircle, Clock } from 'lucide-react';

interface Sender {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
}

interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  imageUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
  sender: Sender;
}

interface ChatWindowProps {
  bookingId: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyAvatar?: string | null;
  initialMessages?: Message[];
}

export function ChatWindow({
  bookingId,
  currentUserId,
  otherPartyName,
  otherPartyAvatar,
  initialMessages = [],
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Play subtle web audio chime on incoming message
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio context policy fallback
    }
  };

  // Scroll to bottom on message update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Load and poll messages with strict reference stability
  useEffect(() => {
    let isMounted = true;
    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat/messages?bookingId=${bookingId}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.messages) {
            setMessages((prev) => {
              if (data.messages.length === prev.length) {
                const lastPrev = prev[prev.length - 1];
                const lastData = data.messages[data.messages.length - 1];
                if (!lastPrev || (lastData && lastPrev.id === lastData.id && lastPrev.readAt === lastData.readAt)) {
                  return prev;
                }
              }

              const newest = data.messages[data.messages.length - 1];
              if (newest && newest.senderId !== currentUserId && !prev.some((m) => m.id === newest.id)) {
                playChime();
                setToastMessage(`New message from ${newest.sender.firstName}: "${newest.content || 'Photo update'}"`);
                setTimeout(() => setToastMessage(null), 4000);
              }
              return data.messages;
            });
          }
        }
      } catch (e) {
        console.error('Failed loading messages', e);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [bookingId, currentUserId]);

  // Mark unread messages as read
  useEffect(() => {
    async function markAsRead() {
      try {
        await fetch('/api/chat/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        });
      } catch (e) {
        console.error(e);
      }
    }
    markAsRead();
  }, [bookingId, messages.length]);

  // Establish SSE stream for instant push
  useEffect(() => {
    const eventSource = new EventSource(`/api/chat/stream?bookingId=${bookingId}`);

    eventSource.addEventListener('message', (e) => {
      try {
        const newMessage: Message = JSON.parse(e.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        if (newMessage.senderId !== currentUserId) {
          playChime();
          setToastMessage(`New message from ${newMessage.sender.firstName}: "${newMessage.content || 'Photo update'}"`);
          setTimeout(() => setToastMessage(null), 4000);
        }
      } catch (err) {
        console.error('Error parsing SSE message', err);
      }
    });

    eventSource.addEventListener('read', (e) => {
      try {
        const readData = JSON.parse(e.data);
        setMessages((prev) =>
          prev.map((m) => (m.senderId === currentUserId ? { ...m, readAt: readData.readAt } : m))
        );
      } catch (err) {
        console.error('Error parsing SSE read event', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [bookingId, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedPhoto) || isSending) return;

    const contentToSend = inputText.trim();
    const photoToSend = selectedPhoto;

    setInputText('');
    setSelectedPhoto(null);
    setIsSending(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          content: contentToSend,
          imageUrl: photoToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      } else {
        const errData = await res.json();
        console.error('Chat API Error:', res.status, errData);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  const samplePhotoPresets = [
    { id: 'bedtime-photo', label: '📷 Bedtime Photo', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400' },
    { id: 'snack-time', label: '🍎 Snack Time', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400' },
    { id: 'crafts-games', label: '🎨 Crafts & Games', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div
      id="chat-window-container"
      data-testid="chat-window"
      className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[520px] max-w-2xl w-full mx-auto relative font-sans mb-16"
    >
      {/* Floating In-App Toast Notification */}
      {toastMessage && (
        <div
          id="chat-toast-notification"
          data-testid="chat-toast"
          className="absolute top-16 left-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={otherPartyAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={otherPartyName}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-400/40"
          />
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{otherPartyName}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Booking Locked Chat • Metro Vancouver
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[11px] font-semibold text-blue-200 border border-white/10">
          <Clock className="w-3.5 h-3.5" /> SSE Stream Live
        </div>
      </div>

      {/* Message List */}
      <div id="chat-messages-list" data-testid="chat-messages-list" className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No messages yet in this booking thread.</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Send a message or attach a photo update to communicate securely.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                data-testid="chat-message-bubble"
                data-sender-id={m.senderId}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={m.sender.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                  />
                )}

                <div
                  className={`max-w-[78%] rounded-2xl p-3.5 space-y-1.5 shadow-sm text-xs ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  {/* Photo attachment if present */}
                  {m.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/20 mb-1">
                      <img src={m.imageUrl} className="max-h-48 w-full object-cover" alt="Attachment" data-testid="chat-message-photo" />
                    </div>
                  )}

                  {m.content && (
                    <p data-testid="chat-message-text" className="leading-relaxed whitespace-pre-wrap font-normal">
                      {m.content}
                    </p>
                  )}

                  <div
                    className={`flex items-center justify-end gap-1.5 text-[10px] ${
                      isMe ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <CheckCheck className={`w-3.5 h-3.5 ${m.readAt ? 'text-emerald-300 font-bold' : 'text-blue-200'}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Photo Attachments Toolbar */}
      {selectedPhoto ? (
        <div className="bg-blue-50 px-4 py-2 border-t border-blue-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img src={selectedPhoto} className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-blue-900 text-[11px]">Photo Attached</span>
          </div>
          <button onClick={() => setSelectedPhoto(null)} className="text-blue-600 hover:text-blue-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-slate-100/80 px-3 py-1.5 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] shrink-0">
            Quick Photo:
          </span>
          {samplePhotoPresets.map((preset) => (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              data-testid={`preset-btn-${preset.id}`}
              type="button"
              onClick={() => setSelectedPhoto(preset.url)}
              className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 px-2.5 py-1 rounded-full border border-slate-200 transition-all shrink-0 font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          id="chat-message-input"
          data-testid="chat-message-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${otherPartyName}...`}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />

        <button
          id="chat-send-button"
          data-testid="chat-send-button"
          type="submit"
          disabled={isSending || (!inputText.trim() && !selectedPhoto)}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-2xl shadow-md transition-all shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
