"use client";

import {
  Check,
  FileChartColumn,
  FileJson,
  FileText,
  ImageIcon,
  ListChecks,
  MessageSquareText,
  Presentation,
  Share2,
  Video,
  WandSparkles,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import {
  OUTPUT_OPTIONS,
} from "@/lib/constants/transformation";

import {
  cn,
} from "@/lib/utils";

import type {
  OutputType,
} from "@/types/api";


const ICONS: Record<
  OutputType,
  LucideIcon
> = {
  executive_summary:
    FileText,

  detailed_summary:
    FileChartColumn,

  advisory:
    WandSparkles,

  linkedin:
    Share2,

  x_thread:
    MessageSquareText,

  infographic:
    ImageIcon,

  presentation:
    Presentation,

  video_script:
    Video,

  action_items:
    ListChecks,

  structured_data:
    FileJson,
};


interface OutputSelectorProps {
  value: OutputType[];

  disabled?: boolean;

  onChange:
    (
      value:
        OutputType[]
    ) => void;
}


export function OutputSelector({
  value,
  disabled = false,
  onChange,
}: OutputSelectorProps) {
  function toggle(
    output:
      OutputType
  ) {
    if (
      disabled
    ) {
      return;
    }

    if (
      value.includes(
        output
      )
    ) {
      onChange(
        value.filter(
          (
            item
          ) =>
            item !==
            output
        )
      );

      return;
    }

    onChange([
      ...value,
      output,
    ]);
  }


  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {OUTPUT_OPTIONS.map(
        (
          option
        ) => {
          const selected =
            value.includes(
              option.value
            );

          const Icon =
            ICONS[
              option.value
            ];

          return (
            <button
              key={
                option.value
              }
              type="button"
              disabled={
                disabled
              }
              onClick={() =>
                toggle(
                  option.value
                )
              }
              className={cn(
                "relative rounded-xl border p-4 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "hover:border-primary/40 hover:bg-muted/30",
                disabled &&
                  "cursor-not-allowed opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {
                      option.label
                    }
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {
                      option.description
                    }
                  </p>
                </div>
              </div>

              {selected && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        }
      )}
    </div>
  );
}