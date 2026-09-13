import type {
  ReactNode,
} from "react";

import {
  AppHeader,
} from "@/components/layout/app-header";

import {
  AppSidebar,
} from "@/components/layout/app-sidebar";


interface AppShellProps {
  children: ReactNode;

  userEmail:
    string | null;
}


export function AppShell({
  children,
  userEmail,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <AppSidebar />
      </div>

      <div className="lg:pl-72">
        <AppHeader
          userEmail={
            userEmail
          }
        />

        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}