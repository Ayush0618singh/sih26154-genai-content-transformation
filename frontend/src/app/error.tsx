"use client";

import Link from "next/link";

import {
  AlertTriangle,
  Home,
  RefreshCw,
} from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-5 py-16">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            TransformAI could not complete this page request. You can retry the page or return to the workspace.
          </p>

          {process.env.NODE_ENV ===
            "development" && (
            <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-left">
              <p className="break-words font-mono text-xs text-muted-foreground">
                {
                  error.message
                }
              </p>

              {error.digest && (
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
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
              onClick={
                reset
              }
            >
              <RefreshCw className="mr-2 size-4" />

              Try Again
            </Button>

            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({
                  variant:
                    "outline",
                })
              )}
            >
              <Home className="mr-2 size-4" />

              Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}