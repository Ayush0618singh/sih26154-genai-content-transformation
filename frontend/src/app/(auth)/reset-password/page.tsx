"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
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

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
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


  const passwordsMatch =
    Boolean(
      confirmPassword
    ) &&
    password ===
      confirmPassword;


  return (
    <>
      <AuthHeading
        title="Create a new password"
        description="Secure your TransformAI account with a new password of at least eight characters."
      />

      <Card className="premium-card border-primary/15">
        <CardContent className="p-6 sm:p-7">
          <div
            className={[
              "mb-6",
              "flex",
              "items-center",
              "gap-3",

              "rounded-xl",

              "border",
              "border-primary/15",

              "bg-primary/5",

              "p-3.5",
            ].join(" ")}
          >
            <KeyRound className="size-4 text-primary" />

            <p className="text-xs leading-5 text-muted-foreground">
              Your new password will immediately replace your
              existing account password.
            </p>
          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold"
              >
                New password
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
                  required
                  minLength={8}
                  autoComplete="new-password"
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
                  aria-label="Toggle password visibility"
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
            </div>


            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-semibold"
              >
                Confirm new password
              </Label>

              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  className="h-11 rounded-xl bg-background/55 pl-10 pr-11"
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

                <button
                  type="button"
                  aria-label="Toggle confirmation password visibility"
                  className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() =>
                    setShowConfirmPassword(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {passwordsMatch && (
                <div className="flex items-center gap-2 text-[11px] font-medium text-primary">
                  <CheckCircle2 className="size-3.5" />

                  Passwords match
                </div>
              )}
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
                <KeyRound className="size-4" />
              )}

              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}