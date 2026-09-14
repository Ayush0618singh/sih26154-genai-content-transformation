"use client";

import {
  useState,
} from "react";

import {
  Menu,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  AppSidebar,
} from "@/components/layout/app-sidebar";

import {
  ThemeToggle,
} from "@/components/shared/theme-toggle";


interface AppHeaderProps {
  userEmail:
    string | null;
}


function initialsFromEmail(
  email: string | null
) {
  if (!email) {
    return "U";
  }

  return email
    .charAt(0)
    .toUpperCase();
}


export function AppHeader({
  userEmail,
}: AppHeaderProps) {
  const [
    open,
    setOpen,
  ] = useState(false);


  return (
    <header
      className={[
        "sticky",
        "top-0",
        "z-30",

        "flex",
        "h-[76px]",
        "items-center",

        "border-b",
        "border-border/70",

        "bg-background/78",
        "backdrop-blur-2xl",

        "px-4",
        "sm:px-6",
        "lg:px-8",
        "xl:px-10",
      ].join(" ")}
    >
      <Sheet
        open={open}
        onOpenChange={
          setOpen
        }
      >
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="mr-3 lg:hidden"
              aria-label="Open navigation"
            />
          }
        >
          <Menu className="size-4" />
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[17.5rem] border-r-0 p-0"
        >
          <AppSidebar
            className="w-full border-r-0"
            onNavigate={() =>
              setOpen(false)
            }
          />
        </SheetContent>
      </Sheet>


      <div className="min-w-0 flex-1">
        <div
          className={[
            "flex",
            "items-center",
            "gap-2",

            "text-[10px]",
            "font-bold",
            "uppercase",
            "tracking-[0.15em]",
            "text-primary",
          ].join(" ")}
        >
          <Sparkles className="size-3.5" />

          AI Content Intelligence
        </div>

        <p
          className={[
            "mt-1",
            "truncate",

            "text-sm",
            "font-medium",
            "tracking-[-0.01em]",
            "text-foreground/90",
          ].join(" ")}
        >
          Transform source intelligence into trusted communication.
        </p>
      </div>


      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={[
            "hidden",
            "items-center",
            "gap-2",

            "rounded-full",

            "border",
            "border-primary/20",

            "bg-primary/7",

            "px-3",
            "py-1.5",

            "text-[10px]",
            "font-bold",
            "uppercase",
            "tracking-[0.1em]",
            "text-primary",

            "xl:flex",
          ].join(" ")}
        >
          <ShieldCheck className="size-3.5" />

          Secure Workspace
        </div>

        <ThemeToggle />

        <div className="hidden text-right sm:block">
          <p
            className={[
              "max-w-48",
              "truncate",
              "text-xs",
              "font-semibold",
            ].join(" ")}
          >
            {userEmail ??
              "Signed in user"}
          </p>

          <p
            className={[
              "mt-0.5",
              "text-[10px]",
              "font-medium",
              "text-muted-foreground",
            ].join(" ")}
          >
            Authenticated
          </p>
        </div>

        <div
          className={[
            "relative",
            "flex",
            "size-10",
            "items-center",
            "justify-center",

            "overflow-hidden",

            "rounded-xl",

            "border",
            "border-primary/30",

            "bg-primary",
            "text-sm",
            "font-bold",
            "text-primary-foreground",

            "shadow-[0_10px_28px_-14px_var(--primary)]",
          ].join(" ")}
        >
          <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />

          <span className="relative">
            {initialsFromEmail(
              userEmail
            )}
          </span>
        </div>
      </div>
    </header>
  );
}