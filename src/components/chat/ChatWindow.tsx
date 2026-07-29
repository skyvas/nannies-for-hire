'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Camera, Video, CheckCheck, Sparkles, X, MessageSquare, AlertCircle, Clock, Play } from 'lucide-react';

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

export interface ChatAttachment {
  url: string;
  type: 'image' | 'video';
  name?: string;
}

interface ChatWindowProps {
  bookingId: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyAvatar?: string | null;
  initialMessages?: Message[];
}

function parseMediaAttachments(imageUrl?: string | null): ChatAttachment[] {
  if (!imageUrl) return [];
  try {
    if (imageUrl.startsWith('[')) {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // Fallback to single URL string
  }
  const isVideo = imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') || imageUrl.startsWith('data:video');
  return [{ url: imageUrl, type: isVideo ? 'video' : 'image' }];
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
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [previewMedia, setPreviewMedia] = useState<ChatAttachment | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewMedia(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
                setToastMessage(`New message from ${newest.sender.firstName}: "${newest.content || 'Media update'}"`);
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
          setToastMessage(`New message from ${newMessage.sender.firstName}: "${newMessage.content || 'Media update'}"`);
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

  // Mobile & File Browser Media Selection (Max 3)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = attachments.length;
    const availableSlots = 3 - currentCount;

    if (availableSlots <= 0) {
      setToastMessage('Maximum 3 photo or video attachments allowed per message.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    if (files.length > availableSlots) {
      setToastMessage(`You can only attach up to 3 files. Added the first ${availableSlots} file(s).`);
      setTimeout(() => setToastMessage(null), 4000);
    }

    const filesToProcess = files.slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video');
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setAttachments((prev) => {
            if (prev.length >= 3) return prev;
            return [...prev, { url: result, type: isVideo ? 'video' : 'image', name: file.name }];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddPreset = (url: string, type: 'image' | 'video' = 'image', name?: string) => {
    if (attachments.length >= 3) {
      setToastMessage('Maximum 3 photo or video attachments allowed per message.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    setAttachments((prev) => [...prev, { url, type, name }]);
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isSending) return;

    const contentToSend = inputText.trim();
    const attachmentsToSend = [...attachments];

    setInputText('');
    setAttachments([]);
    setIsSending(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          content: contentToSend,
          imageUrl: attachmentsToSend.length > 0 ? JSON.stringify(attachmentsToSend) : null,
          attachments: attachmentsToSend,
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
    { id: 'bedtime-photo', label: '📷 Bedtime Photo', type: 'image' as const, url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400' },
    { id: 'park-video', label: '🎥 Park Video', type: 'video' as const, url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { id: 'snack-time', label: '🍎 Snack Time', type: 'image' as const, url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400' },
    { id: 'crafts-games', label: '🎨 Crafts & Games', type: 'image' as const, url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div
      id="chat-window-container"
      data-testid="chat-window"
      className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[560px] max-w-2xl w-full mx-auto relative font-sans mb-16"
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
              Send a message, photo, or video update to communicate securely.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            const mediaList = parseMediaAttachments(m.imageUrl);

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
                  className={`max-w-[78%] rounded-2xl p-3.5 space-y-2 shadow-sm text-xs ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  {/* Media attachments (photos or videos) */}
                  {mediaList.length > 0 && (
                    <div className="space-y-1.5 mb-1">
                      {mediaList.map((att, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-white/20 bg-slate-950">
                          {att.type === 'video' ? (
                            <video
                              src={att.url}
                              controls
                              className="max-h-56 w-full object-cover"
                              data-testid="chat-message-video"
                            />
                          ) : (
                            <img
                              src={att.url}
                              className="max-h-48 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                              alt="Attachment"
                              data-testid="chat-message-photo"
                              onClick={() => setPreviewMedia({ url: att.url, type: att.type, name: att.name })}
                              title="Click to view full-screen"
                            />
                          )}
                        </div>
                      ))}
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

      {/* Attachment Previews Bar (Small Thumbnails, max 3) */}
      {attachments.length > 0 && (
        <div
          id="chat-attachments-preview-bar"
          data-testid="chat-attachments-preview-bar"
          className="bg-blue-50/90 px-4 py-2 border-t border-blue-200 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider shrink-0">
              Attached ({attachments.length}/3):
            </span>
            {attachments.map((att, idx) => (
              <div
                key={idx}
                data-testid={`attachment-preview-${idx}`}
                className="relative group shrink-0 rounded-xl overflow-hidden border-2 border-blue-500 bg-slate-900 w-12 h-12 flex items-center justify-center shadow-xs"
              >
                {att.type === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950 text-white">
                    <video src={att.url} className="w-full h-full object-cover opacity-70" />
                    <Video className="w-4 h-4 text-white absolute z-10 drop-shadow" />
                  </div>
                ) : (
                  <img src={att.url} className="w-full h-full object-cover" alt="Preview" />
                )}

                <button
                  type="button"
                  data-testid={`remove-attachment-btn-${idx}`}
                  onClick={() => handleRemoveAttachment(idx)}
                  className="absolute top-0.5 right-0.5 bg-slate-900/80 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors z-20"
                  title="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {attachments.length < 3 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 shrink-0 bg-white border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors shadow-xs"
            >
              + Add File
            </button>
          )}
        </div>
      )}

      {/* Mobile Preset Attachment Toolbar */}
      <div className="bg-slate-100/80 px-3 py-1.5 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] shrink-0">
          Quick Media:
        </span>
        {samplePhotoPresets.map((preset) => (
          <button
            key={preset.id}
            id={`preset-btn-${preset.id}`}
            data-testid={`preset-btn-${preset.id}`}
            type="button"
            onClick={() => handleAddPreset(preset.url, preset.type, preset.label)}
            className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 px-2.5 py-1 rounded-full border border-slate-200 transition-all shrink-0 font-medium text-[11px]"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input Form with Mobile Camera / File Browser Button */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        {/* Hidden File Input for Mobile Device Camera & File Picker */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="chat-file-input"
          data-testid="chat-file-input"
        />

        {/* Touch-Friendly Camera/Attachment Trigger */}
        <button
          type="button"
          id="chat-attach-button"
          data-testid="chat-attach-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={attachments.length >= 3}
          title="Attach Photo or Video from device (up to 3)"
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors disabled:opacity-40 shrink-0 flex items-center justify-center"
        >
          <Camera className="w-4 h-4" />
        </button>

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
          disabled={isSending || (!inputText.trim() && attachments.length === 0)}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-2xl shadow-md transition-all shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Full-Screen Photo & Media Lightbox Modal */}
      {previewMedia && (
        <div
          id="chat-lightbox-overlay"
          data-testid="chat-lightbox-modal"
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Lightbox Top Header Controls */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white z-50 py-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">
                {previewMedia.name || (previewMedia.type === 'video' ? 'Video Attachment' : 'Photo Attachment')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={previewMedia.url}
                download={previewMedia.name || 'attachment'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors"
              >
                Download
              </a>
              <button
                id="close-lightbox-btn"
                data-testid="close-lightbox-btn"
                onClick={() => setPreviewMedia(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-colors"
                title="Close full-screen (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Full-Screen Image / Video Container */}
          <div
            className="flex-1 flex items-center justify-center w-full max-w-5xl my-auto p-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {previewMedia.type === 'video' ? (
              <video
                src={previewMedia.url}
                controls
                autoPlay
                className="max-h-[82vh] max-w-full rounded-2xl shadow-2xl bg-black"
                data-testid="lightbox-video"
              />
            ) : (
              <img
                src={previewMedia.url}
                alt="Full screen photo preview"
                className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl select-none"
                data-testid="lightbox-image"
              />
            )}
          </div>

          {/* Bottom Caption / Touch Hint */}
          <div className="text-[11px] text-slate-400 font-medium py-1">
            Tap anywhere outside or press <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> to close
          </div>
        </div>
      )}
    </div>
  );
}
