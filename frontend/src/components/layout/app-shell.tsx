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
  children:
    ReactNode;

  userEmail:
    string | null;
}


export function AppShell({
  children,
  userEmail,
}: AppShellProps) {
  return (
    <div className="premium-page min-h-screen bg-background">
      <div
        className={[
          "fixed",
          "inset-y-0",
          "left-0",
          "z-40",
          "hidden",
          "lg:block",
        ].join(" ")}
      >
        <AppSidebar />
      </div>

      <div className="min-h-screen lg:pl-[17.5rem]">
        <AppHeader
          userEmail={
            userEmail
          }
        />

        <main
          className={[
            "relative",
            "min-h-[calc(100vh-4.75rem)]",

            "px-4",
            "py-5",

            "sm:px-6",
            "sm:py-6",

            "lg:px-8",
            "lg:py-8",

            "xl:px-10",
          ].join(" ")}
        >
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}