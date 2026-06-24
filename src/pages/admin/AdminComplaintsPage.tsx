import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Complaint, ComplaintStatus } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/stamp-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDistanceToNow } from "@/lib/format";
import { ChevronRight } from "lucide-react";

const TABS: Array<{ label: string; statuses: ComplaintStatus[] | "all" }> = [
  { label: "All", statuses: "all" },
  { label: "Open", statuses: ["open"] },
  { label: "In Review", statuses: ["in_review"] },
  { label: "Pending", statuses: ["pending_info"] },
  { label: "Escalated", statuses: ["escalated"] },
  { label: "Resolved", statuses: ["resolved", "closed"] },
];

export default function AdminComplaintsPage() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!profile?.university_id) return;

    const loadComplaints = async () => {
      const q = query(
        collection(db, "complaints"),
        where("university_id", "==", profile.university_id),
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

  function filtered(): Complaint[] {
    const tab = TABS.find((t) => t.label === activeTab);
    if (!tab || tab.statuses === "all") return complaints;
    return complaints.filter((c) =>
      (tab.statuses as ComplaintStatus[]).includes(c.status),
    );
  }

  const list = filtered();

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Complaints</h1>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.label}
                value={t.label}
                className="text-xs">
                {t.label}
                <span className="ml-1.5 text-muted-foreground">
                  {t.statuses === "all"
                    ? complaints.length
                    : complaints.filter((c) =>
                        (t.statuses as ComplaintStatus[]).includes(c.status),
                      ).length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((t) => (
            <TabsContent
              key={t.label}
              value={t.label}
              className="mt-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-lg bg-card animate-pulse"
                    />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No complaints in this category.
                </p>
              ) : (
                <div className="space-y-2">
                  {list.map((c) => (
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
                                <span className="text-[10px] font-mono font-bold text-ochre-500 uppercase tracking-wide">
                                  URGENT
                                </span>
                              )}
                              {c.is_anonymous && (
                                <span className="text-[10px] text-muted-foreground italic">
                                  anonymous
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell>
  );
}
