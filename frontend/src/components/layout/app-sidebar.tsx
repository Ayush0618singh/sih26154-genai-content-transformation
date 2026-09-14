"use client";

import {
  BarChart3,
  FileClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  toast,
} from "sonner";

import {
  AppLogo,
} from "@/components/shared/app-logo";

import {
  Button,
} from "@/components/ui/button";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  cn,
} from "@/lib/utils";


const navigation = [
  {
    name:
      "Dashboard",

    description:
      "Workspace overview",

    href:
      "/dashboard",

    icon:
      LayoutDashboard,
  },

  {
    name:
      "Transform",

    description:
      "Create AI outputs",

    href:
      "/transform",

    icon:
      WandSparkles,
  },

  {
    name:
      "Documents",

    description:
      "Source library",

    href:
      "/documents",

    icon:
      FileText,
  },

  {
    name:
      "History",

    description:
      "Transformation runs",

    href:
      "/history",

    icon:
      FileClock,
  },

  {
    name:
      "Analytics",

    description:
      "Usage intelligence",

    href:
      "/analytics",

    icon:
      BarChart3,
  },
];


interface AppSidebarProps {
  className?: string;

  onNavigate?:
    () => void;
}


export function AppSidebar({
  className,
  onNavigate,
}: AppSidebarProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();


  async function signOut() {
    try {
      const supabase =
        createClient();

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace(
        "/login"
      );

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign out."
      );
    }
  }


  const settingsActive =
    pathname === "/settings" ||
    pathname.startsWith(
      "/settings/"
    );


  return (
    <aside
      className={cn(
        [
          "relative",

          "flex",
          "h-full",
          "w-[17.5rem]",
          "flex-col",

          "overflow-hidden",

          "border-r",
          "border-sidebar-border",

          "bg-sidebar/94",

          "text-sidebar-foreground",

          "backdrop-blur-2xl",

          "shadow-[18px_0_60px_-46px_rgba(0,0,0,0.55)]",
        ].join(" "),

        className
      )}
    >
      <div
        className={[
          "pointer-events-none",
          "absolute",
          "-left-24",
          "-top-24",

          "size-64",

          "rounded-full",

          "bg-primary/12",
          "blur-3xl",
        ].join(" ")}
      />

      <div
        className={[
          "relative",
          "flex",
          "h-[76px]",
          "items-center",

          "border-b",
          "border-sidebar-border/80",

          "px-5",
        ].join(" ")}
      >
        <AppLogo
          href="/dashboard"
        />
      </div>


      <div
        className={[
          "relative",
          "flex-1",
          "overflow-y-auto",

          "px-3",
          "py-5",
        ].join(" ")}
      >
        <div
          className={[
            "mb-3",
            "px-3",

            "text-[10px]",
            "font-bold",
            "uppercase",
            "tracking-[0.18em]",
            "text-muted-foreground",
          ].join(" ")}
        >
          Workspace
        </div>

        <nav className="space-y-1.5">
          {navigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                pathname ===
                  item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  onClick={
                    onNavigate
                  }
                  className={cn(
                    [
                      "group/nav",
                      "relative",

                      "flex",
                      "items-center",
                      "gap-3",

                      "overflow-hidden",

                      "rounded-xl",

                      "border",
                      "border-transparent",

                      "px-3",
                      "py-2.5",

                      "transition-all",
                      "duration-200",
                    ].join(" "),

                    active
                      ? [
                          "border-primary/25",
                          "bg-primary/10",
                          "text-foreground",

                          "shadow-[0_10px_28px_-22px_var(--primary)]",
                        ].join(
                          " "
                        )
                      : [
                          "text-muted-foreground",

                          "hover:border-border/70",
                          "hover:bg-sidebar-accent/70",
                          "hover:text-foreground",
                        ].join(
                          " "
                        )
                  )}
                >
                  {active && (
                    <span
                      className={[
                        "absolute",
                        "left-0",
                        "top-1/2",

                        "h-7",
                        "w-[3px]",

                        "-translate-y-1/2",

                        "rounded-r-full",

                        "bg-primary",

                        "shadow-[0_0_14px_var(--primary)]",
                      ].join(" ")}
                    />
                  )}

                  <span
                    className={cn(
                      [
                        "flex",
                        "size-9",
                        "shrink-0",
                        "items-center",
                        "justify-center",

                        "rounded-lg",

                        "border",

                        "transition-all",
                        "duration-200",
                      ].join(" "),

                      active
                        ? [
                            "border-primary/25",
                            "bg-primary/15",
                            "text-primary",
                          ].join(
                            " "
                          )
                        : [
                            "border-border/60",
                            "bg-card/50",

                            "group-hover/nav:border-primary/20",
                            "group-hover/nav:text-primary",
                          ].join(
                            " "
                          )
                    )}
                  >
                    <Icon className="size-[17px]" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        [
                          "block",
                          "truncate",

                          "text-sm",
                          "font-semibold",
                          "tracking-[-0.01em]",
                        ].join(" "),

                        active &&
                          "text-foreground"
                      )}
                    >
                      {
                        item.name
                      }
                    </span>

                    <span
                      className={[
                        "mt-0.5",
                        "block",
                        "truncate",

                        "text-[10px]",
                        "font-medium",
                        "text-muted-foreground",
                      ].join(" ")}
                    >
                      {
                        item.description
                      }
                    </span>
                  </span>
                </Link>
              );
            }
          )}
        </nav>


        <div className="my-5 gold-divider" />


        <div
          className={[
            "relative",
            "overflow-hidden",

            "rounded-2xl",

            "border",
            "border-primary/20",

            "bg-primary/7",

            "p-4",
          ].join(" ")}
        >
          <div
            className={[
              "pointer-events-none",
              "absolute",
              "-right-8",
              "-top-8",

              "size-24",

              "rounded-full",

              "bg-primary/15",
              "blur-2xl",
            ].join(" ")}
          />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "flex",
                  "size-8",
                  "items-center",
                  "justify-center",

                  "rounded-lg",

                  "border",
                  "border-primary/25",

                  "bg-primary/12",
                  "text-primary",
                ].join(" ")}
              >
                <Sparkles className="size-4" />
              </span>

              <div>
                <p className="text-xs font-bold">
                  Intelligence Pipeline
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Production ready
                </p>
              </div>
            </div>

            <div
              className={[
                "mt-4",

                "flex",
                "items-center",
                "gap-2",

                "text-[10px]",
                "font-semibold",
                "text-muted-foreground",
              ].join(" ")}
            >
              <ShieldCheck className="size-3.5 text-primary" />

              OCR · Vision · RAG · Gemini
            </div>
          </div>
        </div>
      </div>


      <div
        className={[
          "relative",

          "space-y-2",

          "border-t",
          "border-sidebar-border/80",

          "p-3",
        ].join(" ")}
      >
        <Link
          href="/settings"
          onClick={
            onNavigate
          }
          className={cn(
            [
              "flex",
              "h-10",
              "w-full",
              "items-center",

              "rounded-xl",

              "border",
              "border-transparent",

              "px-3",

              "text-sm",
              "font-semibold",

              "transition-all",
            ].join(" "),

            settingsActive
              ? [
                  "border-primary/25",
                  "bg-primary/10",
                  "text-foreground",
                ].join(" ")
              : [
                  "text-muted-foreground",

                  "hover:border-border/70",
                  "hover:bg-sidebar-accent/70",
                  "hover:text-foreground",
                ].join(" ")
          )}
        >
          <Settings className="mr-3 size-4" />

          Settings
        </Link>

        <Button
          type="button"
          variant="ghost"
          className={[
            "w-full",
            "justify-start",
            "text-muted-foreground",

            "hover:bg-destructive/8",
            "hover:text-destructive",
          ].join(" ")}
          onClick={
            signOut
          }
        >
          <LogOut className="mr-1 size-4" />

          Sign out
        </Button>
      </div>
    </aside>
  );
}