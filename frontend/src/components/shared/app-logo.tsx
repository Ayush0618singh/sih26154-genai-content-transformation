import Link from "next/link";

import {
  Sparkles,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";


interface AppLogoProps {
  href?: string;

  compact?: boolean;

  className?: string;
}


export function AppLogo({
  href = "/",
  compact = false,
  className,
}: AppLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        [
          "group",
          "inline-flex",
          "items-center",
          "gap-3",
        ].join(" "),

        className
      )}
    >
      <span
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
          "text-primary-foreground",

          "shadow-[0_12px_34px_-16px_var(--primary)]",

          "transition-all",
          "duration-300",

          "group-hover:-translate-y-0.5",
          "group-hover:shadow-[0_18px_42px_-16px_var(--primary)]",
        ].join(" ")}
      >
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />

        <Sparkles className="relative z-10 size-5" />
      </span>

      {!compact && (
        <span className="flex min-w-0 flex-col">
          <span
            className={[
              "truncate",
              "text-[15px]",
              "font-bold",
              "leading-none",
              "tracking-[-0.03em]",
            ].join(" ")}
          >
            Transform
            <span className="text-primary">
              AI
            </span>
          </span>

          <span
            className={[
              "mt-1.5",
              "text-[9px]",
              "font-bold",
              "uppercase",
              "tracking-[0.22em]",
              "text-muted-foreground",
            ].join(" ")}
          >
            SIH26154
          </span>
        </span>
      )}
    </Link>
  );
}