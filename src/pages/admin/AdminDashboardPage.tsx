import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Complaint, University } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/stamp-badge";
import { formatDistanceToNow } from "@/lib/format";
import {
  FileText,
  Clock,
  TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle2,
  ChevronRight,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.university_id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const profileUniversityId = profile.university_id;

    const loadData = async () => {
      try {
        const [complaintsSnapshot, universitySnapshot] = await Promise.all([
          getDocs(
            query(
              collection(db, "complaints"),
              where("university_id", "==", profileUniversityId),
              orderBy("created_at", "desc"),
            ),
          ),
          getDoc(doc(db, "universities", profileUniversityId)),
        ]);

        if (cancelled) return;

        setComplaints(
          complaintsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Complaint, "id">),
          })),
        );

        if (universitySnapshot.exists()) {
          const data = universitySnapshot.data() as Omit<University, "id">;
          setUniversity({
            id: universitySnapshot.id,
            monthly_fee: data.monthly_fee ?? 2000,
            is_paid: data.is_paid ?? false,
            billing_details: data.billing_details ?? null,
            ...data,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "open").length,
    urgent: complaints.filter(
      (c) =>
        c.priority === "urgent" &&
        c.status !== "closed" &&
        c.status !== "resolved",
    ).length,
    resolved: complaints.filter(
      (c) => c.status === "resolved" || c.status === "closed",
    ).length,
  };

  const recent = complaints.slice(0, 5);

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold">SRC Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and respond to student complaints
          </p>
        </div>

        {/* Payment Status Card */}
        {university && (
          <Card
            className={`border-2 ${
              university.is_paid
                ? "border-emerald-300/50 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-destructive/30 bg-destructive/5"
            }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard
                    className={`h-5 w-5 ${
                      university.is_paid
                        ? "text-emerald-600"
                        : "text-destructive"
                    }`}
                  />
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    university.is_paid
                      ? "border-emerald-300 bg-emerald-500/10 text-emerald-700"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}>
                  {university.is_paid ? "Paid" : "Payment Due"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-black">Monthly Fee</p>
                  <p className="text-xl font-bold">
                    ₦ {university.monthly_fee.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black">Status</p>
                  <p className="text-sm font-medium">
                    {university.is_paid
                      ? "✓ Paid and active"
                      : "⚠ Payment required for access"}
                  </p>
                </div>
              </div>

              {university.billing_details && (
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    BILLING DETAILS
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-foreground">
                    {university.billing_details}
                  </p>
                </div>
              )}

              {!university.is_paid && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">
                    Contact the super admin to process payment and regain
                    access.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: FileText,
              color: "text-foreground",
            },
            {
              label: "Open",
              value: stats.open,
              icon: Clock,
              color: "text-terracotta-600",
            },
            {
              label: "Urgent",
              value: stats.urgent,
              icon: AlertTriangle,
              color: "text-ochre-500",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: CheckCircle2,
              color: "text-olive-600",
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold font-display">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent complaints</h2>
            <Link
              to="/admin/complaints"
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
          ) : recent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No complaints yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recent.map((c) => (
                <Link
                  key={c.id}
                  to={`/admin/complaints/${c.id}`}>
                  <Card className="hover:border-border/80 transition-colors cursor-pointer group">
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
                          {c.priority === "urgent" && (
                            <span className="text-[10px] font-mono font-bold text-ochre-500 uppercase">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate">
                          {c.title}
                        </p>
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
      </div>
    </AppShell>
  );
}
