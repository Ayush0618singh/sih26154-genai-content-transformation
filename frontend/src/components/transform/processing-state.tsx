"use client";

import {
  BrainCircuit,
  Check,
  Database,
  Loader2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  Progress,
} from "@/components/ui/progress";

import {
  cn,
} from "@/lib/utils";


const STEPS = [
  {
    title:
      "Content Intelligence",

    description:
      "Understanding source structure, topics, facts, entities and metrics.",

    icon:
      BrainCircuit,
  },

  {
    title:
      "Evidence Grounding",

    description:
      "Connecting the generation pipeline with relevant source evidence.",

    icon:
      Database,
  },

  {
    title:
      "AI Transformation",

    description:
      "Adapting source intelligence for your audience, language and objective.",

    icon:
      WandSparkles,
  },

  {
    title:
      "Output Generation",

    description:
      "Creating and validating the selected communication formats.",

    icon:
      Sparkles,
  },
];


interface ProcessingStateProps {
  currentStage:
    number;
}


export function ProcessingState({
  currentStage,
}: ProcessingStateProps) {
  const safeStage =
    Math.min(
      Math.max(
        currentStage,
        0
      ),
      STEPS.length -
        1
    );


  const progressValues = [
    20,
    45,
    72,
    92,
  ];


  return (
    <section
      className={[
        "relative",
        "overflow-hidden",

        "rounded-[1.75rem]",

        "border",
        "border-primary/20",

        "bg-gradient-to-br",
        "from-primary/10",
        "via-card/95",
        "to-card",

        "p-6",

        "shadow-[0_30px_90px_-55px_var(--primary)]",

        "sm:p-8",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none",
          "absolute",
          "-right-32",
          "-top-32",

          "size-80",

          "rounded-full",

          "bg-primary/14",
          "blur-[90px]",
        ].join(" ")}
      />


      <div className="relative">
        <div
          className={[
            "flex",
            "flex-col",
            "justify-between",
            "gap-5",

            "sm:flex-row",
            "sm:items-center",
          ].join(" ")}
        >
          <div className="flex items-start gap-4">
            <div
              className={[
                "relative",

                "flex",
                "size-12",
                "shrink-0",
                "items-center",
                "justify-center",

                "rounded-2xl",

                "border",
                "border-primary/30",

                "bg-primary",
                "text-primary-foreground",

                "shadow-[0_15px_40px_-20px_var(--primary)]",
              ].join(" ")}
            >
              <Loader2 className="size-5 animate-spin" />

              <span
                className={[
                  "absolute",
                  "inset-0",
                  "-z-10",

                  "animate-ping",
                  "rounded-2xl",

                  "bg-primary/25",
                ].join(" ")}
              />
            </div>


            <div>
              <div className="premium-kicker">
                <Sparkles className="size-3.5" />

                AI Pipeline Active
              </div>

              <h2
                className={[
                  "mt-3",

                  "text-xl",
                  "font-bold",
                  "tracking-[-0.03em]",

                  "sm:text-2xl",
                ].join(" ")}
              >
                Transforming your source
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                TransformAI is analysing your content and creating
                grounded outputs. The stage indicator below is an
                estimated representation while the backend completes
                the request.
              </p>
            </div>
          </div>


          <div
            className={[
              "flex",
              "shrink-0",
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

            Secure Processing
          </div>
        </div>


        <div
          className={[
            "mt-7",

            "rounded-2xl",

            "border",
            "border-border/70",

            "bg-background/45",

            "p-4",

            "sm:p-5",
          ].join(" ")}
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold">
              Pipeline progress
            </span>

            <span className="text-xs font-bold text-primary">
              {
                progressValues[
                  safeStage
                ]
              }
              %
            </span>
          </div>

          <Progress
            value={
              progressValues[
                safeStage
              ]
            }
            className="h-2"
          />
        </div>


        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {STEPS.map(
            (
              step,
              index
            ) => {
              const Icon =
                step.icon;

              const active =
                index ===
                safeStage;

              const completed =
                index <
                safeStage;


              return (
                <div
                  key={
                    step.title
                  }
                  className={cn(
                    [
                      "relative",
                      "overflow-hidden",

                      "rounded-2xl",

                      "border",

                      "p-4",

                      "transition-all",
                      "duration-300",
                    ].join(" "),

                    active
                      ? [
                          "border-primary/35",
                          "bg-primary/8",

                          "shadow-[0_15px_40px_-30px_var(--primary)]",
                        ].join(" ")
                      : completed
                        ? [
                            "border-primary/15",
                            "bg-primary/4",
                          ].join(" ")
                        : [
                            "border-border/70",
                            "bg-background/35",
                          ].join(" ")
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={cn(
                        [
                          "flex",
                          "size-9",
                          "items-center",
                          "justify-center",

                          "rounded-xl",

                          "border",

                          "transition-all",
                        ].join(" "),

                        active
                          ? [
                              "border-primary/25",
                              "bg-primary",
                              "text-primary-foreground",
                            ].join(" ")
                          : completed
                            ? [
                                "border-primary/20",
                                "bg-primary/10",
                                "text-primary",
                              ].join(" ")
                            : [
                                "border-border",
                                "bg-muted/40",
                                "text-muted-foreground",
                              ].join(" ")
                      )}
                    >
                      {completed ? (
                        <Check className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </div>


                    <span
                      className={cn(
                        [
                          "text-[9px]",
                          "font-bold",
                          "uppercase",
                          "tracking-[0.1em]",
                        ].join(" "),

                        active
                          ? "text-primary"
                          : completed
                            ? "text-primary/75"
                            : "text-muted-foreground/65"
                      )}
                    >
                      {completed
                        ? "Complete"
                        : active
                          ? "Processing"
                          : "Queued"}
                    </span>
                  </div>


                  <p className="mt-4 text-sm font-semibold">
                    {
                      step.title
                    }
                  </p>

                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    {
                      step.description
                    }
                  </p>


                  {active && (
                    <div
                      className={[
                        "absolute",
                        "inset-x-4",
                        "bottom-0",

                        "h-[2px]",

                        "overflow-hidden",

                        "rounded-full",

                        "bg-primary/15",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "h-full",
                          "w-1/2",

                          "animate-pulse",

                          "rounded-full",

                          "bg-primary",
                        ].join(" ")}
                      />
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>


        <p
          className={[
            "mt-5",
            "text-center",

            "text-[10px]",
            "font-medium",
            "text-muted-foreground",
          ].join(" ")}
        >
          Keep this page open while the transformation is processing.
          You will be redirected automatically when the outputs are ready.
        </p>
      </div>
    </section>
  );
}