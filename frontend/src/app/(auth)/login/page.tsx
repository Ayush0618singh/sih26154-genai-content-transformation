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


export default function LoginPage() {
  const router =
    useRouter();

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

    setLoading(true);

    try {
      const supabase =
        createClient();

      const {
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email.trim(),
            password,
          }
        );

      if (error) {
        throw error;
      }

      toast.success(
        "Signed in successfully."
      );

      router.replace(
        "/dashboard"
      );

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleGoogleLogin() {
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
          : "Google sign-in failed."
      );
    }
  }


  return (
    <>
      <AuthHeading
        title="Welcome back"
        description="Sign in to transform, analyse and repurpose your content."
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
              handleGoogleLogin
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
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password">
                  Password
                </Label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
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

              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an
            account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}