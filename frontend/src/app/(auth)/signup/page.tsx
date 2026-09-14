"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  AuthHeading,
} from "@/components/auth/auth-heading";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Separator,
} from "@/components/ui/separator";

import {
  createClient,
} from "@/lib/supabase/client";


export default function SignupPage() {
  const router =
    useRouter();

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      password.length < 8
    ) {
      toast.error(
        "Password must contain at least 8 characters."
      );

      return;
    }

    setLoading(true);

    try {
      const supabase =
        createClient();

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/dashboard`;

      const {
        data,
        error,
      } =
        await supabase.auth.signUp(
          {
            email:
              email.trim(),

            password,

            options: {
              emailRedirectTo:
                redirectTo,

              data: {
                full_name:
                  fullName.trim(),
              },
            },
          }
        );

      if (error) {
        throw error;
      }

      if (
        data.session
      ) {
        toast.success(
          "Account created successfully."
        );

        router.replace(
          "/dashboard"
        );

        router.refresh();

        return;
      }

      toast.success(
        "Account created. Check your email to confirm your account."
      );

      router.replace(
        "/login"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleGoogleSignup() {
    setGoogleLoading(
      true
    );

    try {
      const supabase =
        createClient();

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/dashboard`;

      const {
        error,
      } =
        await supabase.auth.signInWithOAuth(
          {
            provider:
              "google",

            options: {
              redirectTo,
            },
          }
        );

      if (error) {
        throw error;
      }
    } catch (error) {
      setGoogleLoading(
        false
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Google sign-up failed."
      );
    }
  }


  return (
    <>
      <AuthHeading
        title="Create your workspace"
        description="Create your secure TransformAI account and start converting source content into professional AI-generated assets."
      />

      <Card className="premium-card border-primary/15">
        <CardContent className="p-6 sm:p-7">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full bg-background/55"
            disabled={
              googleLoading ||
              loading
            }
            onClick={
              handleGoogleSignup
            }
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span
                className={[
                  "flex",
                  "size-6",
                  "items-center",
                  "justify-center",

                  "rounded-full",

                  "border",

                  "bg-background",

                  "text-xs",
                  "font-bold",
                ].join(" ")}
              >
                G
              </span>
            )}

            Continue with Google
          </Button>


          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />

            <span
              className={[
                "text-[10px]",
                "font-bold",
                "uppercase",
                "tracking-[0.15em]",
                "text-muted-foreground",
              ].join(" ")}
            >
              or create with email
            </span>

            <Separator className="flex-1" />
          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-xs font-semibold"
              >
                Full name
              </Label>

              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="fullName"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  className="h-11 rounded-xl bg-background/55 pl-10"
                  value={
                    fullName
                  }
                  onChange={(
                    event
                  ) =>
                    setFullName(
                      event.target
                        .value
                    )
                  }
                />
              </div>
            </div>


            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold"
              >
                Email address
              </Label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 rounded-xl bg-background/55 pl-10"
                  value={
                    email
                  }
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                />
              </div>
            </div>


            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold"
              >
                Password
              </Label>

              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="h-11 rounded-xl bg-background/55 pl-10 pr-11"
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() =>
                    setShowPassword(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <CheckCircle2
                  className={[
                    "size-3.5",
                    password.length >=
                    8
                      ? "text-primary"
                      : "",
                  ].join(" ")}
                />

                Minimum 8 characters
              </div>
            </div>


            <Button
              type="submit"
              size="lg"
              className="mt-2 h-11 w-full"
              disabled={
                loading ||
                googleLoading
              }
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}

              Create secure workspace
            </Button>
          </form>


          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}