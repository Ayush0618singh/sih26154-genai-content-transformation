import type {
  ReactNode,
} from "react";

import {
  redirect,
} from "next/navigation";

import {
  AppShell,
} from "@/components/layout/app-shell";

import {
  createClient,
} from "@/lib/supabase/server";


export const dynamic =
  "force-dynamic";


export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.getClaims();

  const claims =
    data?.claims;

  if (
    error ||
    !claims?.sub
  ) {
    redirect(
      "/login"
    );
  }

  const email =
    typeof claims.email ===
    "string"
      ? claims.email
      : null;

  return (
    <AppShell
      userEmail={
        email
      }
    >
      {children}
    </AppShell>
  );
}