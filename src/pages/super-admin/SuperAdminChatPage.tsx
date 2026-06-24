import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Profile, University } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface AdminChatMessage {
  id: string;
  author_id: string;
  author_role: "src_officer" | "super_admin";
  message: string;
  created_at: string;
}

interface AdminChat {
  id: string;
  university_id: string;
  university_name: string;
  last_message: string;
  updated_at: string;
}

export default function SuperAdminChatPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [selectedChat, setSelectedChat] = useState<AdminChat | null>(null);
  const [chatList, setChatList] = useState<AdminChat[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const chatsQuery = query(
      collection(db, "admin_chats"),
      orderBy("updated_at", "desc"),
    );

    const unsub = onSnapshot(chatsQuery, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AdminChat, "id">),
      }));
      setChatList(chats);
      if (!selectedChat && chats.length > 0) {
        setSelectedChat(chats[0]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;

    const messagesQuery = query(
      collection(doc(db, "admin_chats", selectedChat.id), "messages"),
      orderBy("created_at", "asc"),
    );

    const unsub = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<AdminChatMessage, "id">),
        })),
      );
    });

    return () => unsub();
  }, [selectedChat]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const profileId = profile?.id;

  const activeChatTitle = useMemo(
    () =>
      selectedChat
        ? `${selectedChat.university_name} SRC`
        : "Choose a university chat",
    [selectedChat],
  );

  const handleSelectChat = (chat: AdminChat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (!profileId || !selectedChat || !messageText.trim()) return;

    const now = new Date().toISOString();
    const chatDocRef = doc(db, "admin_chats", selectedChat.id);
    const messagesCollection = collection(chatDocRef, "messages");

    await setDoc(
      chatDocRef,
      {
        university_id: selectedChat.university_id,
        university_name: selectedChat.university_name,
        last_message: messageText.trim(),
        updated_at: now,
      },
      { merge: true },
    );

    await addDoc(messagesCollection, {
      author_id: profileId,
      author_role: "super_admin",
      message: messageText.trim(),
      created_at: now,
    });

    setMessageText("");
  };

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">
              SRC Super Admin Chat
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reply to SRC officers and manage campus conversations.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="max-h-[660px] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">SRC Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 overflow-auto max-h-[520px]">
              {loading ? (
                <div className="flex h-44 items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : chatList.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No active SRC chats yet.
                </div>
              ) : (
                chatList.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedChat?.id === chat.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted"
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{chat.university_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground truncate">
                      {chat.last_message}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{activeChatTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="min-h-[320px] rounded-2xl border border-border bg-background p-4 shadow-sm overflow-auto">
                {!selectedChat ? (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Select an SRC chat to view messages.
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    No messages yet. Send the first reply.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((message) => {
                      const isSuper = message.author_role === "super_admin";
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSuper ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                              isSuper
                                ? "bg-primary text-primary-foreground border-primary/20"
                                : "bg-muted text-foreground border-border"
                            }`}>
                            <p>{message.message}</p>
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              {message.author_role === "super_admin"
                                ? "Super Admin"
                                : "SRC Officer"}{" "}
                              • {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Reply to the selected SRC officer..."
                  className="min-h-[120px]"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-muted-foreground">
                    Replies appear instantly for SRC officers.
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!selectedChat || !messageText.trim()}>
                    Send reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
