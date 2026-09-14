"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Loader2,
  Mail,
  MonitorCog,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  ThemeToggle,
} from "@/components/shared/theme-toggle";

import {
  getApiErrorMessage,
} from "@/lib/api/client";

import {
  getProfile,
  updateProfile,
} from "@/lib/api/profile";


function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-[1.75rem]" />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[430px] rounded-2xl" />

        <div className="space-y-4">
          <Skeleton className="h-52 rounded-2xl" />

          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}


export function SettingsPage() {
  const queryClient =
    useQueryClient();


  const [
    fullName,
    setFullName,
  ] = useState("");


  const [
    avatarUrl,
    setAvatarUrl,
  ] = useState("");


  const profileQuery =
    useQuery({
      queryKey: [
        "profile",
      ],

      queryFn:
        getProfile,
    });


  useEffect(
    () => {
      if (
        !profileQuery.data
      ) {
        return;
      }


      const timer =
        window.setTimeout(
          () => {
            setFullName(
              profileQuery.data
                ?.full_name ??
                ""
            );


            setAvatarUrl(
              profileQuery.data
                ?.avatar_url ??
                ""
            );
          },

          0
        );


      return () =>
        window.clearTimeout(
          timer
        );
    },

    [
      profileQuery.data,
    ]
  );


  const mutation =
    useMutation({
      mutationFn:
        updateProfile,

      onSuccess:
        async () => {
          toast.success(
            "Profile updated successfully."
          );


          await queryClient.invalidateQueries(
            {
              queryKey: [
                "profile",
              ],
            }
          );
        },

      onError:
        (
          error
        ) =>
          toast.error(
            getApiErrorMessage(
              error
            )
          ),
    });


  const hasChanges =
    useMemo(
      () => {
        if (
          !profileQuery.data
        ) {
          return false;
        }


        return (
          fullName.trim() !==
            (
              profileQuery.data
                .full_name ??
              ""
            ).trim() ||
          avatarUrl.trim() !==
            (
              profileQuery.data
                .avatar_url ??
              ""
            ).trim()
        );
      },

      [
        avatarUrl,
        fullName,
        profileQuery.data,
      ]
    );


  if (
    profileQuery.isLoading
  ) {
    return (
      <SettingsSkeleton />
    );
  }


  if (
    profileQuery.isError ||
    !profileQuery.data
  ) {
    return (
      <div
        className={[
          "rounded-2xl",
          "border",
          "border-destructive/30",
          "bg-destructive/5",
          "p-5",
          "text-sm",
          "text-destructive",
        ].join(" ")}
      >
        {getApiErrorMessage(
          profileQuery.error
        )}
      </div>
    );
  }


  const profile =
    profileQuery.data;


  function saveProfile(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    mutation.mutate({
      full_name:
        fullName.trim(),

      avatar_url:
        avatarUrl.trim() ||
        null,
    });
  }


  const initial =
    (
      fullName ||
      profile.email ||
      "U"
    )
      .charAt(0)
      .toUpperCase();


  return (
    <div className="mx-auto max-w-[1350px] space-y-6 lg:space-y-7">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        className={[
          "relative",
          "overflow-hidden",

          "rounded-[1.75rem]",

          "border",
          "border-primary/15",

          "bg-gradient-to-br",
          "from-primary/10",
          "via-card/90",
          "to-card",

          "p-6",

          "shadow-[0_28px_85px_-58px_rgba(0,0,0,0.6)]",

          "sm:p-7",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute -right-28 -top-28 size-72 rounded-full bg-primary/12 blur-[80px]" />


        <div
          className={[
            "relative",

            "flex",
            "flex-col",
            "justify-between",
            "gap-6",

            "sm:flex-row",
            "sm:items-end",
          ].join(" ")}
        >
          <div>
            <div className="premium-kicker">
              <MonitorCog className="size-3.5" />

              Workspace Preferences
            </div>

            <h1
              className={[
                "mt-4",

                "text-3xl",
                "font-bold",
                "tracking-[-0.045em]",

                "sm:text-4xl",
              ].join(" ")}
            >
              Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage your TransformAI profile, application appearance
              and account security information.
            </p>
          </div>


          <div
            className={[
              "flex",
              "w-fit",
              "items-center",
              "gap-2",

              "rounded-full",

              "border",
              "border-primary/20",

              "bg-primary/7",

              "px-3",
              "py-2",

              "text-[10px]",
              "font-bold",
              "uppercase",
              "tracking-[0.1em]",
              "text-primary",
            ].join(" ")}
          >
            <ShieldCheck className="size-3.5" />

            Secure Account
          </div>
        </div>
      </section>


      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {/* =================================================
            PROFILE
            ================================================= */}

        <Card className="premium-card overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-5">
            <div className="flex items-start gap-3">
              <div className="premium-icon-box flex size-11 shrink-0 items-center justify-center rounded-xl">
                <UserRound className="size-5" />
              </div>

              <div>
                <CardTitle>
                  Profile Information
                </CardTitle>

                <CardDescription>
                  Personal details associated with your workspace.
                </CardDescription>
              </div>
            </div>
          </CardHeader>


          <CardContent className="pt-6">
            <div
              className={[
                "mb-6",

                "flex",
                "flex-col",
                "gap-4",

                "rounded-2xl",

                "border",
                "border-primary/15",

                "bg-primary/5",

                "p-4",

                "sm:flex-row",
                "sm:items-center",
              ].join(" ")}
            >
              <div
                className={[
                  "relative",

                  "flex",
                  "size-14",
                  "shrink-0",
                  "items-center",
                  "justify-center",

                  "overflow-hidden",

                  "rounded-2xl",

                  "border",
                  "border-primary/30",

                  "bg-primary",
                  "text-xl",
                  "font-bold",
                  "text-primary-foreground",

                  "shadow-[0_14px_36px_-20px_var(--primary)]",
                ].join(" ")}
              >
                <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />

                <span className="relative">
                  {initial}
                </span>
              </div>


              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold">
                  {profile.full_name ||
                    "TransformAI User"}
                </p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {profile.email ??
                    "No email available"}
                </p>


                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/8 text-primary"
                  >
                    <ShieldCheck className="mr-1 size-3" />

                    {profile.role}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="border-border/70 bg-background/50"
                  >
                    <CheckCircle2 className="mr-1 size-3 text-primary" />

                    Authenticated
                  </Badge>
                </div>
              </div>
            </div>


            <form
              onSubmit={
                saveProfile
              }
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="full-name"
                  className="text-xs font-semibold"
                >
                  Full name
                </Label>

                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="full-name"
                    className="h-11 rounded-xl bg-background/55 pl-10"
                    placeholder="Your full name"
                    value={
                      fullName
                    }
                    onChange={(
                      event
                    ) =>
                      setFullName(
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              </div>


              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Authentication email
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    className="h-11 rounded-xl bg-muted/35 pl-10"
                    disabled
                    value={
                      profile.email ??
                      ""
                    }
                  />
                </div>

                <p className="text-[10px] leading-5 text-muted-foreground">
                  Authentication identity is managed securely through
                  Supabase Auth.
                </p>
              </div>


              <div className="space-y-2">
                <Label
                  htmlFor="avatar"
                  className="text-xs font-semibold"
                >
                  Avatar URL
                </Label>

                <Input
                  id="avatar"
                  type="url"
                  className="h-11 rounded-xl bg-background/55"
                  placeholder="https://example.com/avatar.jpg"
                  value={
                    avatarUrl
                  }
                  onChange={(
                    event
                  ) =>
                    setAvatarUrl(
                      event.target
                        .value
                    )
                  }
                />

                <p className="text-[10px] leading-5 text-muted-foreground">
                  Optional profile image URL. Leaving this empty keeps
                  the generated account initial.
                </p>
              </div>


              <div
                className={[
                  "flex",
                  "flex-col",
                  "justify-between",
                  "gap-3",

                  "border-t",
                  "border-border/60",

                  "pt-5",

                  "sm:flex-row",
                  "sm:items-center",
                ].join(" ")}
              >
                <div>
                  <p className="text-xs font-medium">
                    {hasChanges
                      ? "Unsaved profile changes"
                      : "Profile is up to date"}
                  </p>

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Changes are saved to your authenticated profile.
                  </p>
                </div>


                <Button
                  type="submit"
                  size="lg"
                  className="h-11"
                  disabled={
                    mutation.isPending ||
                    !hasChanges
                  }
                >
                  {mutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}

                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>


        <div className="space-y-4">
          {/* ===============================================
              APPEARANCE
              =============================================== */}

          <Card className="premium-card overflow-hidden">
            <CardHeader className="border-b border-border/60 pb-5">
              <div className="flex items-start gap-3">
                <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Palette className="size-4" />
                </div>

                <div>
                  <CardTitle>
                    Appearance
                  </CardTitle>

                  <CardDescription>
                    Personalize the application theme.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>


            <CardContent className="pt-6">
              <div
                className={[
                  "flex",
                  "items-center",
                  "justify-between",
                  "gap-4",

                  "rounded-xl",

                  "border",
                  "border-border/70",

                  "bg-background/45",

                  "p-4",
                ].join(" ")}
              >
                <div>
                  <p className="text-sm font-semibold">
                    Application Theme
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Switch between light, dark and system appearance.
                  </p>
                </div>

                <ThemeToggle />
              </div>


              <div
                className={[
                  "mt-3",

                  "rounded-xl",

                  "border",
                  "border-primary/15",

                  "bg-primary/5",

                  "p-4",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />

                  <p className="text-xs font-semibold">
                    Premium Interface
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Obsidian, ivory and champagne-gold styling is
                  optimized for both light and dark themes.
                </p>
              </div>
            </CardContent>
          </Card>


          {/* ===============================================
              SECURITY
              =============================================== */}

          <Card className="premium-card overflow-hidden">
            <CardHeader className="border-b border-border/60 pb-5">
              <div className="flex items-start gap-3">
                <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Fingerprint className="size-4" />
                </div>

                <div>
                  <CardTitle>
                    Account & Security
                  </CardTitle>

                  <CardDescription>
                    Identity and authorization status.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>


            <CardContent className="space-y-3 pt-6">
              <div
                className={[
                  "flex",
                  "items-center",
                  "justify-between",
                  "gap-4",

                  "rounded-xl",

                  "border",
                  "border-border/70",

                  "bg-background/45",

                  "p-4",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-4 text-primary" />

                  <div>
                    <p className="text-xs font-semibold">
                      Workspace Role
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      API authorization role
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/8 text-primary"
                >
                  {profile.role}
                </Badge>
              </div>


              <div
                className={[
                  "rounded-xl",

                  "border",
                  "border-primary/15",

                  "bg-primary/5",

                  "p-4",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" />

                  <p className="text-xs font-semibold">
                    Security Architecture
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Authentication is handled through Supabase Auth.
                  Backend APIs validate user identity independently,
                  while database rows and private storage remain
                  isolated to each authenticated workspace.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}