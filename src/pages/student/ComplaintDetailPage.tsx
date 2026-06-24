import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Complaint, ComplaintUpdate } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StampBadge, StatusPill } from "@/components/ui/stamp-badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send } from "lucide-react";
import { formatDistanceToNow } from "@/lib/format";

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<{ message: string }>();

  useEffect(() => {
    if (!id) return;

    const loadComplaint = async () => {
      const complaintDoc = await getDoc(doc(db, "complaints", id));
      if (!complaintDoc.exists()) {
        setComplaint(null);
        setLoading(false);
        return;
      }

      const updatesQuery = query(
        collection(db, "complaint_updates"),
        where("complaint_id", "==", id),
        orderBy("created_at", "asc"),
      );
      const updatesSnapshot = await getDocs(updatesQuery);

      setComplaint({
        id: complaintDoc.id,
        ...(complaintDoc.data() as Omit<Complaint, "id">),
      });
      setUpdates(
        updatesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ComplaintUpdate, "id">),
        })),
      );
      setLoading(false);
    };

    loadComplaint();
  }, [id]);

  async function onReply({ message }: { message: string }) {
    if (!complaint || !profile) return;

    const updateRef = await addDoc(collection(db, "complaint_updates"), {
      complaint_id: complaint.id,
      author_id: profile.id,
      message,
      is_internal: false,
      status_change: null,
      created_at: serverTimestamp(),
    });

    const updateSnapshot = await getDoc(updateRef);
    setUpdates((prev) => [
      ...prev,
      {
        id: updateSnapshot.id,
        ...(updateSnapshot.data() as Omit<ComplaintUpdate, "id">),
      },
    ]);
    reset();
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-6 max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-card rounded-lg animate-pulse"
            />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!complaint) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">
          Complaint not found.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="ref-code text-xs text-muted-foreground mb-1">
              {complaint.ref_code}
            </p>
            <h1 className="font-display text-xl font-bold">
              {complaint.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{complaint.category}</span>
              <span>·</span>
              <span className="capitalize">{complaint.priority} priority</span>
              <span>·</span>
              <span>{formatDistanceToNow(complaint.created_at)}</span>
            </div>
          </div>
          <StampBadge
            status={complaint.status}
            size="md"
          />
        </div>

        {/* Description */}
        <Card>
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </CardContent>
        </Card>

        {/* Timeline */}
        {updates.length > 0 && (
          <div>
            <h2 className="font-semibold text-sm mb-3">Updates</h2>
            <div className="space-y-3">
              {updates.map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-4">
                    {u.status_change && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">
                          Status changed to
                        </span>
                        <StatusPill status={u.status_change as any} />
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{u.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(u.created_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reply */}
        {complaint.status !== "closed" && complaint.status !== "resolved" && (
          <>
            <Separator />
            <form
              onSubmit={handleSubmit(onReply)}
              className="space-y-3">
              <Textarea
                placeholder="Add a comment or provide additional information..."
                {...register("message", { required: true })}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
