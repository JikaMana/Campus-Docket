import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Complaint } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/stamp-badge";
import { CirclePlus as PlusCircle, FileText, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "@/lib/format";

export default function StudentComplaintsListPage() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const loadComplaints = async () => {
      const q = query(
        collection(db, "complaints"),
        where("student_id", "==", profile.id),
        orderBy("created_at", "desc"),
      );
      const snapshot = await getDocs(q);
      setComplaints(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Complaint, "id">),
        })),
      );
      setLoading(false);
    };

    loadComplaints();
  }, [profile]);

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">My Complaints</h1>
          <Button asChild>
            <Link
              to="/complaints/new"
              className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New complaint
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 rounded-lg bg-card animate-pulse"
              />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No complaints yet</p>
              <p className="text-sm mt-1">
                When you file a complaint it will appear here.
              </p>
              <Button
                className="mt-6"
                asChild>
                <Link to="/complaints/new">File a complaint</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {complaints.map((c) => (
              <Link
                key={c.id}
                to={`/complaints/${c.id}`}>
                <Card className="hover:border-border/80 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="ref-code text-[10px] text-muted-foreground">
                          {c.ref_code}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {c.category}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {c.priority} priority
                        </span>
                      </div>
                      <p className="text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(c.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={c.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
