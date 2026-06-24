import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../../lib/supabase";
import type { Message, MessageInput } from "../../types/database";

interface MessagesContextType {
  messages: Message[];
  loading: boolean;
  unreadCount: number;
  sendMessage: (input: MessageInput) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: (currentUserId: string) => Promise<void>;
  fetchMessages: (currentUserId: string) => Promise<void>;
  getConversation: (userId1: string, userId2: string) => Message[];
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

async function enrichMessages(records: Message[]): Promise<Message[]> {
  if (records.length === 0) return [];

  const uniqueIds = [
    ...new Set(records.flatMap((m) => [m.sender_id, m.receiver_id])),
  ];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", uniqueIds);

  if (error) {
    console.error("Error enriching messages:", error);
    return records;
  }

  const nameMap = new Map(
    (profiles ?? []).map((p: { id: string; full_name: string | null }) => [
      p.id,
      p.full_name ?? "Unknown",
    ])
  );

  return records.map((m) => ({
    ...m,
    sender_name: nameMap.get(m.sender_id) ?? "Unknown",
    receiver_name: nameMap.get(m.receiver_id) ?? "Unknown",
  }));
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async (currentUserId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      const enriched = await enrichMessages((data ?? []) as Message[]);
      setMessages(enriched);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (input: MessageInput) => {
    const { error } = await supabase.from("messages").insert([input]);
    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);
    if (error) console.error("Error marking message read:", error);
    else
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_read: true } : m))
      );
  };

  const markAllAsRead = async (currentUserId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("receiver_id", currentUserId)
      .eq("is_read", false);
    if (error) console.error("Error marking all read:", error);
    else
      setMessages((prev) =>
        prev.map((m) =>
          m.receiver_id === currentUserId ? { ...m, is_read: true } : m
        )
      );
  };

  const getConversation = (userId1: string, userId2: string): Message[] =>
    messages.filter(
      (m) =>
        (m.sender_id === userId1 && m.receiver_id === userId2) ||
        (m.sender_id === userId2 && m.receiver_id === userId1)
    );

  // Realtime subscription (scoped to current session via RLS)
  useEffect(() => {
    const channel = supabase
      .channel("messages_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const enriched = await enrichMessages([payload.new as Message]);
            setMessages((prev) => [...prev, ...enriched]);
          }
          if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === (payload.new as Message).id
                  ? { ...m, ...(payload.new as Message) }
                  : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <MessagesContext.Provider
      value={{
        messages,
        loading,
        unreadCount,
        sendMessage,
        markAsRead,
        markAllAsRead,
        fetchMessages,
        getConversation,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
