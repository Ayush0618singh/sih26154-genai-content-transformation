"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  AuthHeading,
} from "@/components/auth/auth-heading";

import {
  Button,
  buttonVariants,
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
  createClient,
} from "@/lib/supabase/client";

import {
  cn,
} from "@/lib/utils";


export default function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    sent,
    setSent,
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

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/reset-password`;

      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo,
          }
        );

      if (error) {
        throw error;
      }

      setSent(true);

      toast.success(
        "Password reset email sent."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <AuthHeading
        title="Recover your account"
        description="Enter your registered email address and we will send a secure password recovery link."
      />

      <Card className="premium-card border-primary/15">
        <CardContent className="p-6 sm:p-7">
          {sent ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div
                  className={[
                    "premium-icon-box",
                    "flex",
                    "size-14",
                    "items-center",
                    "justify-center",
                    "rounded-2xl",
                  ].join(" ")}
                >
                  <CheckCircle2 className="size-6" />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-bold tracking-[-0.02em]">
                  Check your inbox
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  If an account exists for{" "}

                  <span className="font-semibold text-foreground">
                    {email}
                  </span>

                  , a secure recovery link has been sent.
                </p>
              </div>

              <Link
                href="/login"
                className={cn(
                  buttonVariants({
                    variant:
                      "default",

                    size:
                      "lg",
                  }),

                  "h-11 w-full"
                )}
              >
                <ArrowLeft className="size-4" />

                Back to sign in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
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
                    required
                    autoComplete="email"
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

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={
                  loading
                }
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}

                Send recovery link
              </Button>

              <Link
                href="/login"
                className={[
                  "flex",
                  "items-center",
                  "justify-center",
                  "gap-2",

                  "text-sm",
                  "font-semibold",
                  "text-muted-foreground",

                  "transition-colors",

                  "hover:text-primary",
                ].join(" ")}
              >
                <ArrowLeft className="size-4" />

                Back to sign in
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}