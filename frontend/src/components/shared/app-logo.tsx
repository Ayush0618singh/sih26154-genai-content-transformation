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
        "inline-flex items-center gap-2.5",
        className
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-5" />
      </span>

      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight">
            TransformAI
          </span>

          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            SIH26154
          </span>
        </span>
      )}
    </Link>
  );
}