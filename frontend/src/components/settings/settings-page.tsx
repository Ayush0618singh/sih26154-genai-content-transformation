"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Mail,
  Save,
  ShieldCheck,
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


  useEffect(() => {
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
  }, [
    profileQuery.data,
  ]);


  const mutation =
    useMutation({
      mutationFn:
        updateProfile,

      onSuccess:
        async () => {
          toast.success(
            "Profile updated."
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


  if (
    profileQuery.isLoading
  ) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }


  if (
    profileQuery.isError ||
    !profileQuery.data
  ) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
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


  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Badge variant="secondary">
          Account
        </Badge>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Settings
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your profile, appearance and account information.
        </p>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>
            Profile
          </CardTitle>

          <CardDescription>
            Personal information shown inside your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={
              saveProfile
            }
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="full-name">
                Full name
              </Label>

              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="full-name"
                  className="pl-10"
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
              <Label>
                Email
              </Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  className="pl-10"
                  disabled
                  value={
                    profile.email ??
                    ""
                  }
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Authentication email is managed by Supabase Auth.
              </p>
            </div>


            <div className="space-y-2">
              <Label htmlFor="avatar">
                Avatar URL
              </Label>

              <Input
                id="avatar"
                type="url"
                placeholder="https://..."
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
            </div>


            <Button
              type="submit"
              disabled={
                mutation.isPending
              }
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}

              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>
            Appearance
          </CardTitle>

          <CardDescription>
            Choose light, dark or system theme.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-medium">
                Application Theme
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Change how the interface appears.
              </p>
            </div>

            <ThemeToggle />
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>
            Account & Security
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" />

              <div>
                <p className="text-sm font-semibold">
                  Role
                </p>

                <p className="text-xs text-muted-foreground">
                  Workspace authorization role
                </p>
              </div>
            </div>

            <Badge variant="secondary">
              {
                profile.role
              }
            </Badge>
          </div>


          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-sm font-semibold">
              Security Architecture
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Authentication uses Supabase Auth. Backend APIs independently validate authentication before accessing user documents, transformations or exports. User-specific database rows are additionally protected using Row Level Security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}