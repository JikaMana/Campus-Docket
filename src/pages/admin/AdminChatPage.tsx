import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { University } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminChatPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [chat, setChat] = useState<AdminChat | null>(null);
  const [universityName, setUniversityName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const universityId = profile?.university_id;

  useEffect(() => {
    if (!universityId) return;

    const chatDocRef = doc(db, "admin_chats", universityId);
    const unsub = onSnapshot(chatDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setChat({
          id: snapshot.id,
          ...(snapshot.data() as Omit<AdminChat, "id">),
        });
      } else {
        setChat(null);
      }
    });

    return () => unsub();
  }, [universityId]);

  useEffect(() => {
    if (!universityId) return;

    const messagesQuery = query(
      collection(doc(db, "admin_chats", universityId), "messages"),
      orderBy("created_at", "asc"),
    );

    const unsub = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<AdminChatMessage, "id">),
        })),
      );
      setLoading(false);
    });

    return () => unsub();
  }, [universityId]);

  useEffect(() => {
    if (!universityId) return;

    const loadUniversity = async () => {
      const universityDoc = await getDoc(doc(db, "universities", universityId));
      if (universityDoc.exists()) {
        const data = universityDoc.data() as Omit<University, "id">;
        setUniversityName(data.name);
      }
    };

    void loadUniversity();
  }, [universityId]);

  useEffect(() => {
    if (messages.length > 0) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const chatTitle = useMemo(
    () =>
      universityName
        ? `${universityName} SRC ↔ Campus Docket Super Admin`
        : "Chat with Campus Docket Super Admin",
    [universityName],
  );

  const handleSendMessage = async () => {
    if (!profile || !universityId || !messageText.trim()) return;

    const now = new Date().toISOString();
    const chatDocRef = doc(db, "admin_chats", universityId);
    const messagesCollection = collection(chatDocRef, "messages");

    await addDoc(messagesCollection, {
      author_id: profile.id,
      author_role: profile.role,
      message: messageText.trim(),
      created_at: now,
    });

    await setDoc(
      chatDocRef,
      {
        university_id: universityId,
        university_name: universityName || "Campus Docket",
        last_message: messageText.trim(),
        updated_at: now,
      },
      { merge: true },
    );

    setMessageText("");
  };

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">
              Super Admin Chat
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Message the Campus Docket super admin in real time.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{chatTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[320px] rounded-2xl border border-border bg-background p-4 shadow-sm">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-sm text-muted-foreground">
                  <p>No conversation yet.</p>
                  <p className="mt-2">
                    Send the first message to the super admin.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((message) => {
                    const isMine = message.author_id === profile.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                            isMine
                              ? "bg-primary text-primary-foreground border-primary/20"
                              : "bg-muted text-foreground border-border"
                          }`}>
                          <p>{message.message}</p>
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            {new Date(message.created_at).toLocaleString()}
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
                placeholder="Write a message to super admin..."
                className="min-h-[120px]"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  Messages are delivered instantly and synced automatically.
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}>
                  Send message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
