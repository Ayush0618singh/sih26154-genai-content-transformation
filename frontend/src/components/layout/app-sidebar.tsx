"use client";

import {
  BarChart3,
  FileClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
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
  buttonVariants,
} from "@/components/ui/button";

import {
  Separator,
} from "@/components/ui/separator";

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

    href:
      "/dashboard",

    icon:
      LayoutDashboard,
  },

  {
    name:
      "Transform",

    href:
      "/transform",

    icon:
      WandSparkles,
  },

  {
    name:
      "Documents",

    href:
      "/documents",

    icon:
      FileText,
  },

  {
    name:
      "History",

    href:
      "/history",

    icon:
      FileClock,
  },

  {
    name:
      "Analytics",

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


  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r bg-card",
        className
      )}
    >
      <div className="flex h-20 items-center px-5">
        <AppLogo
          href="/dashboard"
        />
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Workspace
        </div>

        <nav className="space-y-1">
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
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4.5" />

                  {
                    item.name
                  }
                </Link>
              );
            }
          )}
        </nav>
      </div>

      <div className="space-y-2 border-t p-3">
        <Link
          href="/settings"
          onClick={
            onNavigate
          }
          className={cn(
            buttonVariants({
              variant:
                "ghost",
            }),
            "w-full justify-start"
          )}
        >
          <Settings className="mr-3 size-4" />

          Settings
        </Link>

        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={
            signOut
          }
        >
          <LogOut className="mr-3 size-4" />

          Sign out
        </Button>

        <div className="rounded-xl border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Sparkles className="size-3.5 text-primary" />

            AI Pipeline
          </div>

          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            OCR · Vision · RAG · Gemini · Multi-format exports
          </p>
        </div>
      </div>
    </aside>
  );
}