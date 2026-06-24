import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CircleAlert as AlertCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(3, "University name required"),
  short_name: z
    .string()
    .min(2, "Short name required")
    .max(8, "Max 8 characters")
    .toUpperCase(),
  email_domain: z
    .string()
    .regex(
      /^[a-z0-9.-]+\.[a-z]{2,}$/,
      "Enter a valid email domain (e.g. uct.ac.za)",
    ),
  monthly_fee: z
    .number({ invalid_type_error: "Enter a monthly fee" })
    .min(0, "Fee must be 0 or more"),
  is_paid: z.boolean(),
  billing_details: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function NewUniversityPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      monthly_fee: 2000,
      is_paid: false,
      billing_details: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);

    try {
      await addDoc(collection(db, "universities"), {
        name: values.name,
        short_name: values.short_name.toUpperCase(),
        email_domain: values.email_domain.toLowerCase(),
        logo_url: null,
        monthly_fee: values.monthly_fee,
        is_paid: values.is_paid,
        billing_details: values.billing_details?.trim() || null,
        created_at: new Date().toISOString(),
      });
      navigate("/super-admin/universities", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add university");
    }
  }

  return (
    <AppShell>
      <div className="p-6 max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">Add university</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Register a new institution and configure payment access.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Institution details</CardTitle>
            <CardDescription>
              The email domain is used to match students to their university at
              signup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="University of Cape Town"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="short_name">Short code</Label>
                <Input
                  id="short_name"
                  placeholder="UCT"
                  {...register("short_name")}
                  aria-invalid={!!errors.short_name}
                />
                <p className="text-xs text-muted-foreground">
                  Used in complaint reference codes, e.g. UCT-2024-00001
                </p>
                {errors.short_name && (
                  <p className="text-xs text-destructive">
                    {errors.short_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email_domain">Email domain</Label>
                <Input
                  id="email_domain"
                  placeholder="uct.ac.za"
                  {...register("email_domain")}
                  aria-invalid={!!errors.email_domain}
                />
                {errors.email_domain && (
                  <p className="text-xs text-destructive">
                    {errors.email_domain.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="monthly_fee">Monthly fee (R)</Label>
                  <Input
                    id="monthly_fee"
                    type="number"
                    min={0}
                    step={50}
                    {...register("monthly_fee", { valueAsNumber: true })}
                    aria-invalid={!!errors.monthly_fee}
                  />
                  {errors.monthly_fee && (
                    <p className="text-xs text-destructive">
                      {errors.monthly_fee.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="is_paid">Payment status</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="is_paid"
                      type="checkbox"
                      className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register("is_paid")}
                    />
                    <Label
                      htmlFor="is_paid"
                      className="cursor-pointer">
                      Mark this university as paid
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing_details">Billing details</Label>
                <Textarea
                  id="billing_details"
                  rows={4}
                  placeholder="Bank account, branch, or invoice instructions"
                  {...register("billing_details")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add university"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
