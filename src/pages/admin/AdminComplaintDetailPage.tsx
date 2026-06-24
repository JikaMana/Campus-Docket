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
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type {
  Complaint,
  ComplaintUpdate,
  ComplaintStatus,
} from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StampBadge, StatusPill } from "@/components/ui/stamp-badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "@/lib/format";

const STATUS_OPTIONS: ComplaintStatus[] = [
  "open",
  "in_review",
  "pending_info",
  "escalated",
  "resolved",
  "closed",
];

export default function AdminComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInternal, setIsInternal] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
      is_internal: isInternal,
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

  async function changeStatus(newStatus: ComplaintStatus) {
    if (!complaint || !profile) return;
    setStatusChanging(true);

    try {
      await updateDoc(doc(db, "complaints", complaint.id), {
        status: newStatus,
      });
      setComplaint((prev) => (prev ? { ...prev, status: newStatus } : prev));

      const updateRef = await addDoc(collection(db, "complaint_updates"), {
        complaint_id: complaint.id,
        author_id: profile.id,
        message: `Status changed to ${newStatus.replace("_", " ")}.`,
        is_internal: false,
        status_change: newStatus,
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
    } finally {
      setStatusChanging(false);
    }
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

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="ref-code text-xs text-muted-foreground mb-1">
              {complaint.ref_code}
            </p>
            <h1 className="font-display text-xl font-bold">
              {complaint.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{complaint.category}</span>
              <span>·</span>
              <span className="capitalize">{complaint.priority} priority</span>
              {complaint.is_anonymous && (
                <>
                  <span>·</span>
                  <span className="italic">anonymous</span>
                </>
              )}
              <span>·</span>
              <span>{formatDistanceToNow(complaint.created_at)}</span>
            </div>
          </div>
          <StampBadge
            status={complaint.status}
            size="md"
          />
        </div>

        {/* Status control */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Change status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <Select
                value={complaint.status}
                onValueChange={(v) => changeStatus(v as ComplaintStatus)}
                disabled={statusChanging}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="capitalize">
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusChanging && (
                <span className="text-xs text-muted-foreground">
                  Updating...
                </span>
              )}
            </div>
          </CardContent>
        </Card>

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
            <h2 className="font-semibold text-sm mb-3">Activity</h2>
            <div className="space-y-3">
              {updates.map((u) => (
                <Card
                  key={u.id}
                  className={u.is_internal ? "border-dashed opacity-80" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      {u.status_change && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Status →
                          </span>
                          <StatusPill
                            status={u.status_change as ComplaintStatus}
                          />
                        </div>
                      )}
                      {u.is_internal && (
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <EyeOff className="h-3 w-3" /> Internal note
                        </span>
                      )}
                    </div>
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
        <Separator />
        <form
          onSubmit={handleSubmit(onReply)}
          className="space-y-3">
          <Textarea
            placeholder={
              isInternal
                ? "Internal note (not visible to student)..."
                : "Reply to student..."
            }
            {...register("message", { required: true })}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsInternal((v) => !v)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${isInternal ? "text-ochre-500" : "text-muted-foreground hover:text-foreground"}`}>
              {isInternal ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {isInternal ? "Internal note" : "Visible to student"}
            </button>
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
      </div>
    </AppShell>
  );
}
