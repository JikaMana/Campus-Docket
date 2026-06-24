import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { University } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, FileText, Users, TrendingUp } from "lucide-react";

interface UniStats {
  university: University;
  total: number;
  open: number;
  resolved: number;
}

export default function SuperAdminAnalyticsPage() {
  const [stats, setStats] = useState<UniStats[]>([]);
  const [totals, setTotals] = useState({
    universities: 0,
    complaints: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [uniSnapshot, complaintSnapshot] = await Promise.all([
        getDocs(collection(db, "universities")),
        getDocs(collection(db, "complaints")),
      ]);

      const uniList = uniSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<University, "id">),
      }));
      const compList = complaintSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as {
          university_id: string;
          status: string;
        }),
      }));

      const uniStats: UniStats[] = uniList.map((u) => {
        const uComps = compList.filter((c) => c.university_id === u.id);
        return {
          university: u,
          total: uComps.length,
          open: uComps.filter(
            (c) =>
              c.status === "open" ||
              c.status === "in_review" ||
              c.status === "escalated",
          ).length,
          resolved: uComps.filter(
            (c) => c.status === "resolved" || c.status === "closed",
          ).length,
        };
      });

      setStats(uniStats);
      setTotals({
        universities: uniList.length,
        complaints: compList.length,
        resolved: compList.filter(
          (c) => c.status === "resolved" || c.status === "closed",
        ).length,
      });
      setLoading(false);
    };

    loadData();
  }, []);

  const resolutionRate =
    totals.complaints > 0
      ? Math.round((totals.resolved / totals.complaints) * 100)
      : 0;

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Platform Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview across all institutions
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Universities",
              value: totals.universities,
              icon: Building2,
            },
            {
              label: "Total complaints",
              value: totals.complaints,
              icon: FileText,
            },
            { label: "Resolved", value: totals.resolved, icon: TrendingUp },
            {
              label: "Resolution rate",
              value: `${resolutionRate}%`,
              icon: Users,
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-2xl font-bold font-display">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="font-semibold mb-4">Per institution</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-card animate-pulse"
                />
              ))}
            </div>
          ) : stats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No universities registered yet.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.map((s) => {
                const rate =
                  s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0;
                return (
                  <Card key={s.university.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-medium">{s.university.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.university.email_domain}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {s.total} complaints
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.open} active · {s.resolved} resolved
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Resolution rate</span>
                          <span>{rate}%</span>
                        </div>
                        <Progress
                          value={rate}
                          className="h-1.5"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
