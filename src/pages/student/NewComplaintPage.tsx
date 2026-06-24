import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CircleAlert as AlertCircle } from "lucide-react";

const CATEGORIES = [
  "Academic",
  "Administration",
  "Facilities",
  "Finance",
  "Health & Safety",
  "IT & Technology",
  "Residence",
  "Security",
  "Transport",
  "Other",
];

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

const schema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200),
  category: z.string().min(1, "Select a category"),
  priority: z.enum(PRIORITIES),
  description: z
    .string()
    .min(30, "Please provide at least 30 characters of detail")
    .max(5000),
  is_anonymous: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium", is_anonymous: false },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    if (!profile?.university_id) {
      setError(
        "Your account is not linked to a university. Please contact support.",
      );
      return;
    }

    try {
      const uniSnap = await getDoc(
        doc(db, "universities", profile.university_id),
      );
      const uniShort = uniSnap.exists()
        ? (uniSnap.data().short_name as string)
        : "UNI";
      const refCode = `${uniShort}-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 99999,
      )
        .toString()
        .padStart(5, "0")}`;

      const complaintRef = await addDoc(collection(db, "complaints"), {
        ref_code: refCode,
        university_id: profile.university_id,
        student_id: profile.id,
        assigned_to: null,
        category: values.category,
        title: values.title,
        description: values.description,
        status: "open",
        priority: values.priority,
        is_anonymous: values.is_anonymous,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      navigate(`/complaints/${complaintRef.id}`, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create complaint",
      );
    }
  }

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">
            File a new complaint
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your complaint will be reviewed by your university's SRC.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Complaint details</CardTitle>
            <CardDescription>
              Be as specific as possible to help us resolve your issue faster.
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select onValueChange={(v) => setValue("category", v)}>
                    <SelectTrigger aria-invalid={!!errors.category}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select
                    defaultValue="medium"
                    onValueChange={(v) =>
                      setValue("priority", v as (typeof PRIORITIES)[number])
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem
                          key={p}
                          value={p}
                          className="capitalize">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail. Include relevant dates, locations, and any previous attempts to resolve it."
                  className="min-h-[140px]"
                  {...register("description")}
                  aria-invalid={!!errors.description}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  className="h-4 w-4 rounded border-border accent-primary"
                  {...register("is_anonymous")}
                />
                <label
                  htmlFor="is_anonymous"
                  className="text-sm cursor-pointer">
                  Submit anonymously{" "}
                  <span className="text-muted-foreground">
                    (your name will not be shown to the SRC)
                  </span>
                </label>
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
                  {isSubmitting ? "Filing complaint..." : "Submit complaint"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
