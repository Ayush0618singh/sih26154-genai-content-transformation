"use client";

import Link from "next/link";

import {
  AlertTriangle,
  Home,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import {
  AppLogo,
} from "@/components/shared/app-logo";

import {
  ThemeToggle,
} from "@/components/shared/theme-toggle";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  cn,
} from "@/lib/utils";


interface ErrorPageProps {
  error: Error & {
    digest?:
      string;
  };

  reset:
    () => void;
}


export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  return (
    <div className="premium-page min-h-screen bg-background">
      <header
        className={[
          "flex",
          "h-[76px]",
          "items-center",
          "justify-between",

          "border-b",
          "border-border/60",

          "bg-background/80",

          "px-5",

          "backdrop-blur-xl",

          "sm:px-8",
        ].join(" ")}
      >
        <AppLogo />

        <ThemeToggle />
      </header>


      <main
        className={[
          "flex",
          "min-h-[calc(100vh-76px)]",
          "items-center",
          "justify-center",

          "px-5",
          "py-14",
        ].join(" ")}
      >
        <Card
          className={[
            "premium-card",
            "relative",
            "w-full",
            "max-w-xl",
            "overflow-hidden",

            "border-destructive/20",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute -right-28 -top-28 size-72 rounded-full bg-destructive/8 blur-[80px]" />


          <CardContent className="relative p-7 text-center sm:p-9">
            <div
              className={[
                "mx-auto",

                "flex",
                "size-16",
                "items-center",
                "justify-center",

                "rounded-2xl",

                "border",
                "border-destructive/20",

                "bg-destructive/10",
                "text-destructive",
              ].join(" ")}
            >
              <AlertTriangle className="size-7" />
            </div>


            <div className="mt-6 flex items-center justify-center gap-2">
              <ShieldAlert className="size-3.5 text-destructive" />

              <span
                className={[
                  "text-[10px]",
                  "font-bold",
                  "uppercase",
                  "tracking-[0.15em]",
                  "text-destructive",
                ].join(" ")}
              >
                Application Error
              </span>
            </div>


            <h1
              className={[
                "mt-3",

                "text-2xl",
                "font-bold",
                "tracking-[-0.04em]",

                "sm:text-3xl",
              ].join(" ")}
            >
              Something went wrong
            </h1>


            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              TransformAI could not complete this page request. Your
              workspace remains protected, and you can safely retry
              the request or return to the dashboard.
            </p>


            {process.env.NODE_ENV ===
              "development" && (
              <div
                className={[
                  "mt-6",

                  "rounded-xl",

                  "border",
                  "border-border/70",

                  "bg-muted/25",

                  "p-4",

                  "text-left",
                ].join(" ")}
              >
                <p
                  className={[
                    "mb-2",

                    "text-[9px]",
                    "font-bold",
                    "uppercase",
                    "tracking-[0.12em]",
                    "text-muted-foreground",
                  ].join(" ")}
                >
                  Development details
                </p>

                <p className="break-words font-mono text-xs leading-5 text-muted-foreground">
                  {
                    error.message
                  }
                </p>

                {error.digest && (
                  <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">
                    Digest:{" "}
                    {
                      error.digest
                    }
                  </p>
                )}
              </div>
            )}


            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="h-11"
                onClick={
                  reset
                }
              >
                <RefreshCw className="size-4" />

                Try Again
              </Button>


              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({
                    variant:
                      "outline",

                    size:
                      "lg",
                  }),

                  "h-11"
                )}
              >
                <Home className="size-4" />

                Dashboard
              </Link>
            </div>


            <div className="mt-7 gold-divider" />


            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />

              TransformAI secure workspace
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}