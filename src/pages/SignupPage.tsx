import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { University } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CircleAlert as AlertCircle,
  CircleCheck as CheckCircle2,
} from "lucide-react";

const schema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    student_number: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const { profile, profileLoading, profileError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [matchedUni, setMatchedUni] = useState<University | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [awaitingRedirect, setAwaitingRedirect] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (awaitingRedirect && profile && !profileLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [awaitingRedirect, profile, profileLoading, navigate]);

  useEffect(() => {
    if (awaitingRedirect && !profileLoading && profileError) {
      setAwaitingRedirect(false);
      setError(profileError);
    }
  }, [awaitingRedirect, profileLoading, profileError]);

  async function checkDomain(email: string) {
    const domain = email.split("@")[1];
    if (!domain || domain.length < 4) {
      setMatchedUni(null);
      return;
    }
    setLookingUp(true);
    try {
      const q = query(
        collection(db, "universities"),
        where("email_domain", "==", domain),
      );
      const snapshot = await getDocs(q);
      const match = snapshot.docs[0];
      setMatchedUni(
        match
          ? ({
              id: match.id,
              ...(match.data() as Omit<University, "id">),
            } as University)
          : null,
      );
    } finally {
      setLookingUp(false);
    }
  }

  const emailValue = watch("email");

  async function onSubmit(values: FormValues) {
    setError(null);
    setInfo(null);
    const domain = values.email.split("@")[1];
    const q = query(
      collection(db, "universities"),
      where("email_domain", "==", domain),
    );
    const snapshot = await getDocs(q);
    const uniDoc = snapshot.docs[0];

    if (!uniDoc) {
      setError(
        "Your email domain is not registered with any university on Campus Docket.",
      );
      return;
    }

    const uni = {
      id: uniDoc.id,
      ...(uniDoc.data() as Omit<University, "id">),
    };

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.full_name });

      await setDoc(doc(db, "profiles", user.uid), {
        id: user.uid,
        university_id: uni.id,
        full_name: values.full_name,
        student_number: values.student_number || null,
        role: "student",
        avatar_url: null,
        created_at: new Date().toISOString(),
      });

      setAwaitingRedirect(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">
            <span className="text-terracotta-600">Campus</span>
            <span className="text-foreground">Docket</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create your student account
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Register</CardTitle>
            <CardDescription>Use your university email address</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              {info && (
                <div className="flex items-center gap-2 rounded-md bg-olive-600/10 border border-olive-600/30 px-3 py-2 text-sm text-olive-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {info}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  placeholder="Jane Doe"
                  {...register("full_name")}
                  aria-invalid={!!errors.full_name}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">University email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.ac.za"
                  autoComplete="email"
                  {...register("email", {
                    onBlur: (e) => checkDomain(e.target.value),
                  })}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
                {lookingUp && (
                  <p className="text-xs text-muted-foreground">
                    Checking domain...
                  </p>
                )}
                {!lookingUp && matchedUni && emailValue?.includes("@") && (
                  <div className="flex items-center gap-1.5 text-xs text-olive-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Recognised: {matchedUni.name}
                  </div>
                )}
                {!lookingUp &&
                  !matchedUni &&
                  emailValue?.includes("@") &&
                  emailValue.split("@")[1]?.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      This domain is not registered. Contact your SRC to add
                      your university.
                    </p>
                  )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="student_number">
                  Student number{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="student_number"
                  placeholder="2024001234"
                  {...register("student_number")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("confirm_password")}
                  aria-invalid={!!errors.confirm_password}
                />
                {errors.confirm_password && (
                  <p className="text-xs text-destructive">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || awaitingRedirect}>
                {isSubmitting || awaitingRedirect
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
