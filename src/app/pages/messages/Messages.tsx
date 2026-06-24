import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, User, Check, CheckCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useMessages } from "../../contexts/MessagesContext";
import { supabase } from "../../../lib/supabase";
import type { Profile } from "../../types/database";

// ─── Simple helpers ─────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString();
}

// ─── Component ──────────────────────────────────────────────
export default function Messages() {
  const { user } = useAuth();
  const { messages, loading, sendMessage, fetchMessages, markAllAsRead, getConversation } =
    useMessages();

  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selectedContact, setSelectedContact] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all contacts (profiles) the current user can interact with
  useEffect(() => {
    async function loadContacts() {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .order("full_name", { ascending: true });
      if (!error && data) setContacts(data as Profile[]);
    }
    loadContacts();
  }, [user]);

  // Fetch messages once and mark read on contact select
  useEffect(() => {
    if (user) fetchMessages(user.id);
  }, [user, fetchMessages]);

  useEffect(() => {
    if (user && selectedContact) markAllAsRead(user.id);
  }, [selectedContact, user, markAllAsRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact]);

  const conversation = selectedContact && user
    ? getConversation(user.id, selectedContact.id)
    : [];

  // Group messages by date
  const grouped: { date: string; msgs: typeof conversation }[] = [];
  for (const msg of conversation) {
    const d = formatDate(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last?.date === d) last.msgs.push(msg);
    else grouped.push({ date: d, msgs: [msg] });
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContact || !user) return;
    setSending(true);
    try {
      await sendMessage({
        sender_id: user.id,
        receiver_id: selectedContact.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch {
      // error already logged
    } finally {
      setSending(false);
    }
  };

  const getUnreadForContact = (contactId: string) =>
    messages.filter(
      (m) => m.sender_id === contactId && m.receiver_id === user?.id && !m.is_read
    ).length;

  const getLastMessage = (contactId: string) => {
    const conv = user ? getConversation(user.id, contactId) : [];
    return conv[conv.length - 1] ?? null;
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-73px)] bg-slate-50">
      {/* ── Contact list ─────────────────────────────────── */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Messages</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {contacts.map((contact) => {
            const unread = getUnreadForContact(contact.id);
            const last = getLastMessage(contact.id);
            const isSelected = selectedContact?.id === contact.id;

            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-slate-50 ${
                  isSelected ? "bg-blue-50 border-l-2 border-blue-600" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {contact.full_name ?? contact.email}
                    </span>
                    {last && (
                      <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">
                        {formatTime(last.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-slate-500 truncate">
                      {last ? last.content : "No messages yet"}
                    </p>
                    {unread > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 capitalize">
                    {contact.role}
                  </span>
                </div>
              </button>
            );
          })}

          {!loading && contacts.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">
              No contacts found
            </div>
          )}
        </div>
      </div>

      {/* ── Conversation area ─────────────────────────────── */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Conversation header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {selectedContact.full_name ?? selectedContact.email}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {selectedContact.role}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {loading && (
              <p className="text-center text-sm text-slate-400 py-8">
                Loading messages…
              </p>
            )}

            {!loading && conversation.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">
                  No messages yet. Say hello!
                </p>
              </div>
            )}

            {grouped.map(({ date, msgs }) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[11px] text-slate-400 font-medium">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {msgs.map((msg) => {
                  const isOwn = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 mb-2 ${
                        isOwn ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isOwn && (
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mb-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          isOwn
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`text-[10px] ${
                              isOwn ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            {formatTime(msg.created_at)}
                          </span>
                          {isOwn && (
                            msg.is_read ? (
                              <CheckCheck className="w-3 h-3 text-blue-200" />
                            ) : (
                              <Check className="w-3 h-3 text-blue-200" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message…"
                className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Choose a contact from the left to start messaging.
          </p>
        </div>
      )}
    </div>
  );
}
