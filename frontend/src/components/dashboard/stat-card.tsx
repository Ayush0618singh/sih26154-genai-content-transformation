import type {
  LucideIcon,
} from "lucide-react";

import {
  ArrowUpRight,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";


interface StatCardProps {
  title: string;

  value: string;

  description: string;

  icon: LucideIcon;
}


export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card
      className={[
        "premium-card",
        "group",
        "relative",
        "overflow-hidden",

        "border-border/70",

        "transition-all",
        "duration-300",

        "hover:-translate-y-1",
        "hover:border-primary/25",
        "hover:shadow-[0_24px_70px_-42px_var(--primary)]",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none",
          "absolute",
          "-right-12",
          "-top-12",

          "size-28",

          "rounded-full",

          "bg-primary/8",
          "blur-2xl",

          "transition-all",
          "duration-500",

          "group-hover:bg-primary/14",
        ].join(" ")}
      />

      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className={[
                "text-[11px]",
                "font-bold",
                "uppercase",
                "tracking-[0.12em]",
                "text-muted-foreground",
              ].join(" ")}
            >
              {title}
            </p>

            <p
              className={[
                "mt-3",

                "text-3xl",
                "font-bold",
                "tracking-[-0.045em]",

                "sm:text-[2.1rem]",
              ].join(" ")}
            >
              {value}
            </p>

            <p
              className={[
                "mt-2",
                "max-w-[14rem]",

                "text-xs",
                "leading-5",
                "text-muted-foreground",
              ].join(" ")}
            >
              {description}
            </p>
          </div>

          <div
            className={[
              "premium-icon-box",
              "flex",
              "size-11",
              "shrink-0",
              "items-center",
              "justify-center",

              "rounded-xl",

              "transition-all",
              "duration-300",

              "group-hover:scale-105",
            ].join(" ")}
          >
            <Icon className="size-5" />
          </div>
        </div>

        <div
          className={[
            "mt-5",

            "flex",
            "items-center",
            "gap-1.5",

            "text-[10px]",
            "font-semibold",
            "uppercase",
            "tracking-[0.08em]",
            "text-primary",
          ].join(" ")}
        >
          Workspace metric

          <ArrowUpRight className="size-3" />
        </div>
      </CardContent>
    </Card>
  );
}