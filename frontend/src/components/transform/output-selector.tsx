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
  value:
    OutputType[];

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
          option,
          index
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
                [
                  "group",
                  "relative",
                  "overflow-hidden",

                  "rounded-2xl",

                  "border",

                  "p-4",
                  "text-left",

                  "outline-none",

                  "transition-all",
                  "duration-250",

                  "focus-visible:ring-4",
                  "focus-visible:ring-primary/15",
                ].join(" "),

                selected
                  ? [
                      "border-primary/35",
                      "bg-primary/8",

                      "shadow-[0_18px_45px_-32px_var(--primary)]",

                      "-translate-y-0.5",
                    ].join(" ")
                  : [
                      "border-border/75",
                      "bg-background/45",

                      "hover:-translate-y-0.5",
                      "hover:border-primary/25",
                      "hover:bg-primary/4",
                      "hover:shadow-[0_16px_40px_-34px_var(--primary)]",
                    ].join(" "),

                disabled &&
                  "cursor-not-allowed opacity-60"
              )}
            >
              <div
                className={[
                  "pointer-events-none",
                  "absolute",
                  "-right-10",
                  "-top-10",

                  "size-24",

                  "rounded-full",

                  selected
                    ? "bg-primary/12"
                    : "bg-primary/0",

                  "blur-2xl",

                  "transition-all",
                  "duration-300",

                  "group-hover:bg-primary/8",
                ].join(" ")}
              />


              <div className="relative flex items-start gap-3">
                <div
                  className={cn(
                    [
                      "flex",
                      "size-10",
                      "shrink-0",
                      "items-center",
                      "justify-center",

                      "rounded-xl",

                      "border",

                      "transition-all",
                      "duration-250",
                    ].join(" "),

                    selected
                      ? [
                          "border-primary/25",
                          "bg-primary",
                          "text-primary-foreground",

                          "shadow-[0_10px_28px_-16px_var(--primary)]",
                        ].join(" ")
                      : [
                          "border-border/70",
                          "bg-muted/45",
                          "text-muted-foreground",

                          "group-hover:border-primary/20",
                          "group-hover:bg-primary/8",
                          "group-hover:text-primary",
                        ].join(" ")
                  )}
                >
                  <Icon className="size-[18px]" />
                </div>


                <div className="min-w-0 flex-1 pr-5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold tracking-[-0.01em]">
                      {
                        option.label
                      }
                    </p>

                    <span
                      className={[
                        "text-[9px]",
                        "font-bold",
                        "tracking-[0.08em]",
                        "text-muted-foreground/65",
                      ].join(" ")}
                    >
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    {
                      option.description
                    }
                  </p>
                </div>
              </div>


              <div
                className={cn(
                  [
                    "absolute",
                    "right-3",
                    "top-3",

                    "flex",
                    "size-5",
                    "items-center",
                    "justify-center",

                    "rounded-full",

                    "border",

                    "transition-all",
                    "duration-200",
                  ].join(" "),

                  selected
                    ? [
                        "border-primary",
                        "bg-primary",
                        "text-primary-foreground",
                      ].join(" ")
                    : [
                        "border-border",
                        "bg-background/70",
                        "text-transparent",

                        "group-hover:border-primary/35",
                      ].join(" ")
                )}
              >
                <Check className="size-3" />
              </div>


              {selected && (
                <div
                  className={[
                    "absolute",
                    "inset-x-4",
                    "bottom-0",

                    "h-[2px]",

                    "rounded-full",

                    "bg-gradient-to-r",
                    "from-transparent",
                    "via-primary",
                    "to-transparent",
                  ].join(" ")}
                />
              )}
            </button>
          );
        }
      )}
    </div>
  );
}