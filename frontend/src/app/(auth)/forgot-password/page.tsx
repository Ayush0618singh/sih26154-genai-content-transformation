"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  Loader2,
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
        title="Reset your password"
        description="Enter your account email and we will send you a secure recovery link."
      />

      <Card className="border-border/70 shadow-xl shadow-black/5">
        <CardContent className="p-6 sm:p-7">
          {sent ? (
            <div className="space-y-5">
              <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-6">
                If an account exists
                for{" "}
                <span className="font-semibold">
                  {email}
                </span>
                , check the inbox for
                the password recovery
                link.
              </div>

              <Link
                href="/login"
                className={cn(
                  buttonVariants({
                    variant:
                      "default",
                  }),
                  "w-full"
                )}
              >
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
                <Label htmlFor="email">
                  Email
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11 pl-10"
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
                className="h-11 w-full"
                disabled={
                  loading
                }
              >
                {loading && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}

                Send recovery link
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}