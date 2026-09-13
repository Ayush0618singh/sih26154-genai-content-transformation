import Link from "next/link";

import {
  ArrowLeft,
  FileQuestion,
  Home,
  WandSparkles,
} from "lucide-react";

import {
  AppLogo,
} from "@/components/shared/app-logo";

import {
  ThemeToggle,
} from "@/components/shared/theme-toggle";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";


export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-20 items-center justify-between border-b px-5 sm:px-8">
        <AppLogo />

        <ThemeToggle />
      </header>

      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-16">
        <div className="max-w-xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileQuestion className="size-8" />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            404
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            This page does not exist.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            The link may be incorrect, the resource may have been removed, or you may have reached an unavailable workspace route.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className={cn(
                buttonVariants({
                  variant:
                    "outline",
                })
              )}
            >
              <Home className="mr-2 size-4" />

              Home
            </Link>

            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({
                  variant:
                    "default",
                })
              )}
            >
              <ArrowLeft className="mr-2 size-4" />

              Dashboard
            </Link>

            <Link
              href="/transform"
              className={cn(
                buttonVariants({
                  variant:
                    "ghost",
                })
              )}
            >
              <WandSparkles className="mr-2 size-4" />

              Transform
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}