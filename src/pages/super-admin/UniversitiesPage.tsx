import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { University } from "@/lib/database.types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CirclePlus as PlusCircle, Building2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/format";

export default function SuperAdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<
    Record<string, { monthly_fee: number; billing_details: string }>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const loadUniversities = async () => {
      const q = query(collection(db, "universities"), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      setUniversities(
        snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<University, "id">;
          const { monthly_fee, is_paid, billing_details, ...rest } = data;
          return {
            id: doc.id,
            monthly_fee: monthly_fee ?? 2000,
            is_paid: is_paid ?? false,
            billing_details: billing_details ?? null,
            ...rest,
          };
        }),
      );
      setLoading(false);
    };

    loadUniversities();
  }, []);

  const handleTogglePaid = async (university: University) => {
    setTogglingId(university.id);
    try {
      await updateDoc(doc(db, "universities", university.id), {
        is_paid: !university.is_paid,
      });
      setUniversities((prev) =>
        prev.map((item) =>
          item.id === university.id
            ? { ...item, is_paid: !item.is_paid }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const startEdit = (university: University) => {
    setEditingId(university.id);
    setPaymentForm((prev) => ({
      ...prev,
      [university.id]: {
        monthly_fee: university.monthly_fee ?? 2000,
        billing_details: university.billing_details ?? "",
      },
    }));
  };

  const handlePaymentChange = (
    id: string,
    field: "monthly_fee" | "billing_details",
    value: number | string,
  ) => {
    setPaymentForm((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSavePayment = async (university: University) => {
    const updates = paymentForm[university.id];
    if (!updates) return;

    setSavingId(university.id);
    try {
      await updateDoc(doc(db, "universities", university.id), {
        monthly_fee: updates.monthly_fee,
        billing_details: updates.billing_details.trim() || null,
      });
      setUniversities((prev) =>
        prev.map((item) =>
          item.id === university.id
            ? {
                ...item,
                monthly_fee: updates.monthly_fee,
                billing_details: updates.billing_details.trim() || null,
              }
            : item,
        ),
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Universities</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage institutions and payment access on Campus Docket.
            </p>
          </div>
          <Button asChild>
            <Link
              to="/super-admin/universities/new"
              className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add university
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-lg bg-card animate-pulse"
              />
            ))}
          </div>
        ) : universities.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No universities yet</p>
              <p className="text-sm mt-1">
                Add the first institution to get started.
              </p>
              <Button
                className="mt-6"
                asChild>
                <Link to="/super-admin/universities/new">Add university</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {universities.map((u) => {
              const form = paymentForm[u.id] ?? {
                monthly_fee: u.monthly_fee ?? 2000,
                billing_details: u.billing_details ?? "",
              };

              return (
                <Card
                  key={u.id}
                  className="hover:border-border/80 transition-colors">
                  <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{u.name}</p>
                          <span className="ref-code text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {u.short_name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {u.email_domain}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${
                            u.is_paid
                              ? "border-emerald-300 bg-emerald-500/10 text-emerald-700"
                              : "border-destructive/30 bg-destructive/10 text-destructive"
                          }`}>
                          {u.is_paid ? "Paid" : "Not paid"}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          ₦ {u.monthly_fee.toLocaleString()} / month
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <p className="text-sm font-medium">Billing details</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {u.billing_details || "No billing details set."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePaid(u)}
                          disabled={togglingId === u.id}>
                          {togglingId === u.id
                            ? "Updating..."
                            : u.is_paid
                              ? "Mark unpaid"
                              : "Mark paid"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(u)}>
                          Edit payment
                        </Button>
                        <Button
                          asChild
                          size="sm">
                          <Link
                            to={`/super-admin/universities/${u.id}`}
                            className="text-sm">
                            Details
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(u.created_at)}
                    </p>
                  </CardContent>

                  {editingId === u.id && (
                    <CardContent className="border-t border-border/50 bg-muted/50 p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor={`monthly_fee_${u.id}`}>
                            Monthly fee
                          </Label>
                          <Input
                            id={`monthly_fee_${u.id}`}
                            type="number"
                            min={0}
                            step={50}
                            value={form.monthly_fee}
                            onChange={(event) =>
                              handlePaymentChange(
                                u.id,
                                "monthly_fee",
                                Number(event.target.value),
                              )
                            }
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor={`billing_details_${u.id}`}>
                            Billing details
                          </Label>
                          <Textarea
                            id={`billing_details_${u.id}`}
                            rows={3}
                            value={form.billing_details}
                            onChange={(event) =>
                              handlePaymentChange(
                                u.id,
                                "billing_details",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSavePayment(u)}
                          disabled={savingId === u.id}>
                          {savingId === u.id ? "Saving..." : "Save payment"}
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
