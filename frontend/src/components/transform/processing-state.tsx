"use client";

import {
  BrainCircuit,
  Database,
  Loader2,
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
      "Content intelligence",

    description:
      "Understanding topics, facts, entities and context.",

    icon:
      BrainCircuit,
  },

  {
    title:
      "RAG grounding",

    description:
      "Indexing and retrieving the most relevant source evidence.",

    icon:
      Database,
  },

  {
    title:
      "AI transformation",

    description:
      "Adapting content for the selected audience and communication goals.",

    icon:
      WandSparkles,
  },

  {
    title:
      "Output generation",

    description:
      "Generating your selected content formats.",

    icon:
      Sparkles,
  },
];


interface ProcessingStateProps {
  currentStage: number;
}


export function ProcessingState({
  currentStage,
}: ProcessingStateProps) {
  const progressValues = [
    20,
    45,
    70,
    90,
  ];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-primary" />

        <div>
          <h3 className="font-semibold">
            AI pipeline is
            processing
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Progress below is
            an estimated pipeline
            stage while the backend
            completes the request.
          </p>
        </div>
      </div>

      <Progress
        className="mt-5"
        value={
          progressValues[
            Math.min(
              currentStage,
              progressValues.length -
                1
            )
          ]
        }
      />

      <div className="mt-6 grid gap-3">
        {STEPS.map(
          (
            step,
            index
          ) => {
            const Icon =
              step.icon;

            const active =
              index ===
              currentStage;

            const completed =
              index <
              currentStage;

            return (
              <div
                key={
                  step.title
                }
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                  active &&
                    "border-primary bg-primary/5",
                  completed &&
                    "bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {
                      step.title
                    }
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {
                      step.description
                    }
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}