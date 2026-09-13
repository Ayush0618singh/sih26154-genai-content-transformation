"use client";

import {
  useState,
} from "react";

import {
  Menu,
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
    <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
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
          className="w-72 p-0"
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
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />

          AI Content Workspace
        </div>

        <p className="mt-1 truncate text-sm font-medium">
          Transform source intelligence into useful communication.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="hidden text-right sm:block">
          <p className="max-w-44 truncate text-xs font-semibold">
            {userEmail ??
              "Signed in user"}
          </p>

          <p className="text-[11px] text-muted-foreground">
            Authenticated
          </p>
        </div>

        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {initialsFromEmail(
            userEmail
          )}
        </div>
      </div>
    </header>
  );
}