import Link from "next/link";

import {
  ArrowRight,
  FileQuestion,
  Home,
  Search,
  Sparkles,
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
    <div className="premium-page min-h-screen overflow-hidden bg-background">
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
          "relative",

          "flex",
          "min-h-[calc(100vh-76px)]",
          "items-center",
          "justify-center",

          "overflow-hidden",

          "px-5",
          "py-14",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute left-1/2 top-10 size-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />


        <div className="relative max-w-2xl text-center">
          <div
            className={[
              "premium-icon-box",

              "mx-auto",

              "flex",
              "size-16",
              "items-center",
              "justify-center",

              "rounded-2xl",
            ].join(" ")}
          >
            <FileQuestion className="size-7" />
          </div>


          <div className="mt-6 premium-kicker">
            <Search className="size-3.5" />

            Error 404
          </div>


          <h1
            className={[
              "mt-5",

              "text-3xl",
              "font-bold",
              "tracking-[-0.05em]",

              "sm:text-4xl",
              "lg:text-5xl",
            ].join(" ")}
          >
            This route is outside the{" "}

            <span className="gold-text">
              intelligence map.
            </span>
          </h1>


          <p
            className={[
              "mx-auto",
              "mt-5",
              "max-w-xl",

              "text-sm",
              "leading-7",
              "text-muted-foreground",

              "sm:text-base",
            ].join(" ")}
          >
            The page may have moved, the link may be incorrect, or
            the requested workspace resource is no longer available.
          </p>


          <div
            className={[
              "mt-8",

              "flex",
              "flex-col",
              "justify-center",
              "gap-3",

              "sm:flex-row",
            ].join(" ")}
          >
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({
                  variant:
                    "default",

                  size:
                    "lg",
                }),

                "h-11"
              )}
            >
              <Home className="size-4" />

              Dashboard

              <ArrowRight className="size-4" />
            </Link>


            <Link
              href="/transform"
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
              <WandSparkles className="size-4" />

              Transform Studio
            </Link>
          </div>


          <div className="mt-10 gold-divider" />


          <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />

            TransformAI · SIH26154
          </p>
        </div>
      </main>
    </div>
  );
}