import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Complaint, University } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/stamp-badge";
import {
  CirclePlus as PlusCircle,
  FileText,
  Clock,
  CircleCheck as CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/format";

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [university, setUniversity] = useState<University | null>(null);
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const currentProfile = profile;
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);

      const recentQuery = query(
        collection(db, "complaints"),
        where("student_id", "==", currentProfile.id),
        orderBy("created_at", "desc"),
        limit(5),
      );
      const allQuery = query(
        collection(db, "complaints"),
        where("student_id", "==", currentProfile.id),
      );
      const universityFetch = currentProfile.university_id
        ? getDoc(doc(db, "universities", currentProfile.university_id))
        : Promise.resolve(null);

      const [recentSnapshot, allSnapshot, universityDoc] = await Promise.all([
        getDocs(recentQuery),
        getDocs(allQuery),
        universityFetch,
      ]);

      if (cancelled) return;

      const recent = recentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Complaint, "id">),
      }));
      const all = allSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Complaint, "id">),
      }));
      setComplaints(recent);
      setStats({
        total: all.length,
        open: all.filter(
          (c) =>
            c.status === "open" ||
            c.status === "in_review" ||
            c.status === "escalated",
        ).length,
        resolved: all.filter(
          (c) => c.status === "resolved" || c.status === "closed",
        ).length,
      });

      if (
        currentProfile.university_id &&
        universityDoc &&
        universityDoc.exists()
      ) {
        setUniversity({
          id: universityDoc.id,
          ...(universityDoc.data() as Omit<University, "id">),
        });
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">
              Welcome back, {profile?.full_name?.split(" ")[0] ?? "Student"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Here's the status of your open dockets
            </p>
          </div>
          <Button asChild>
            <Link
              to="/complaints/new"
              className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New complaint
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total filed",
              value: stats.total,
              icon: FileText,
              color: "text-foreground",
            },
            {
              label: "Active",
              value: stats.open,
              icon: Clock,
              color: "text-terracotta-600",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: CheckCircle2,
              color: "text-olive-600",
            },
            // Individuals don't pay only school SRC
            // {
            //   label: university?.is_paid
            //     ? "University paid"
            //     : "Payment due by your UNI",
            //   value: university
            //     ? `R ${university.monthly_fee.toLocaleString()}`
            //     : "--",
            //   icon: university?.is_paid ? CheckCircle2 : Clock,
            //   color: university?.is_paid
            //     ? "text-emerald-600"
            //     : "text-destructive",
            // },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold font-display">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent complaints</h2>
            <Link
              to="/complaints"
              className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-card animate-pulse"
                />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No complaints filed yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  asChild>
                  <Link to="/complaints/new">File your first complaint</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {complaints.map((c) => (
                <Link
                  key={c.id}
                  to={`/complaints/${c.id}`}>
                  <Card className="hover:border-border/80 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="ref-code text-[10px] text-muted-foreground">
                            {c.ref_code}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {c.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(c.created_at)}
                        </p>
                      </div>
                      <StatusPill status={c.status} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
