"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Loader2,
  LockKeyhole,
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
  createClient,
} from "@/lib/supabase/client";


export default function ResetPasswordPage() {
  const router =
    useRouter();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
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

    if (
      password !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match."
      );

      return;
    }

    setLoading(true);

    try {
      const supabase =
        createClient();

      const {
        error,
      } =
        await supabase.auth.updateUser(
          {
            password,
          }
        );

      if (error) {
        throw error;
      }

      toast.success(
        "Password updated successfully."
      );

      router.replace(
        "/dashboard"
      );

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <AuthHeading
        title="Choose a new password"
        description="Set a strong password for your TransformAI account."
      />

      <Card className="border-border/70 shadow-xl shadow-black/5">
        <CardContent className="p-6 sm:p-7">
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="password">
                New password
              </Label>

              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm password
              </Label>

              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-11 pl-10"
                  value={
                    confirmPassword
                  }
                  onChange={(
                    event
                  ) =>
                    setConfirmPassword(
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

              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}