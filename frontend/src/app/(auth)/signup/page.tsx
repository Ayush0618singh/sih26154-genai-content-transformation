"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
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
        title="Create your account"
        description="Start turning source content into grounded, audience-ready outputs."
      />

      <Card className="border-border/70 shadow-xl shadow-black/5">
        <CardContent className="p-6 sm:p-7">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            disabled={
              googleLoading ||
              loading
            }
            onClick={
              handleGoogleSignup
            }
          >
            {googleLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <span className="mr-2 flex size-5 items-center justify-center rounded-full border text-xs font-bold">
                G
              </span>
            )}

            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />

            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              or email
            </span>

            <Separator className="flex-1" />
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full name
              </Label>

              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="fullName"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="h-11 pl-10"
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
              <Label htmlFor="email">
                Email
              </Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 pl-10"
                  value={email}
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
              <Label htmlFor="password">
                Password
              </Label>

              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="h-11 pl-10"
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
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={
                loading ||
                googleLoading
              }
            >
              {loading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}

              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an
            account?{" "}
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