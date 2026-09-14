"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clipboard,
  Database,
  FileJson,
  FileOutput,
  FileText,
  ImageIcon,
  Languages,
  ListChecks,
  MessageSquareText,
  Presentation,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Video,
  WandSparkles,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  ContentViewer,
} from "@/components/results/content-viewer";

import {
  ExportCenter,
} from "@/components/results/export-center";

import {
  getApiErrorMessage,
} from "@/lib/api/client";

import {
  getTransformation,
} from "@/lib/api/transformations";

import {
  cn,
} from "@/lib/utils";

import {
  humanize,
} from "@/lib/utils/format";

import type {
  OutputType,
} from "@/types/api";


interface ResultsWorkspaceProps {
  transformationId:
    string;
}


interface OutputMeta {
  label:
    string;

  description:
    string;

  icon:
    LucideIcon;
}


const OUTPUT_META: Record<
  OutputType,
  OutputMeta
> = {
  executive_summary: {
    label:
      "Executive Summary",

    description:
      "Decision-ready overview of the most important information.",

    icon:
      FileText,
  },

  detailed_summary: {
    label:
      "Detailed Summary",

    description:
      "Expanded structured interpretation of the source.",

    icon:
      FileOutput,
  },

  advisory: {
    label:
      "Advisory",

    description:
      "Recommendations, priorities, risks and next steps.",

    icon:
      ShieldCheck,
  },

  linkedin: {
    label:
      "LinkedIn Post",

    description:
      "Professional communication for a LinkedIn audience.",

    icon:
      MessageSquareText,
  },

  x_thread: {
    label:
      "X Thread",

    description:
      "Structured multi-post social communication.",

    icon:
      MessageSquareText,
  },

  infographic: {
    label:
      "Infographic",

    description:
      "Visual content structure and infographic blueprint.",

    icon:
      ImageIcon,
  },

  presentation: {
    label:
      "Presentation",

    description:
      "Slide-ready narrative, content and presentation structure.",

    icon:
      Presentation,
  },

  video_script: {
    label:
      "Video Script",

    description:
      "Scene-by-scene script, voice-over and captions.",

    icon:
      Video,
  },

  action_items: {
    label:
      "Action Items",

    description:
      "Prioritized actions and execution-oriented next steps.",

    icon:
      ListChecks,
  },

  structured_data: {
    label:
      "Structured Data",

    description:
      "Important source intelligence represented as structured fields.",

    icon:
      FileJson,
  },
};


function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36 rounded-xl" />

      <Skeleton className="h-52 rounded-[1.75rem]" />

      <Skeleton className="h-56 rounded-2xl" />

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Skeleton className="h-[520px] rounded-2xl" />

        <Skeleton className="h-[520px] rounded-2xl" />
      </div>

      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}


function statusClass(
  status:
    string
) {
  switch (
    status.toLowerCase()
  ) {
    case "completed":
      return "border-primary/25 bg-primary/10 text-primary";

    case "failed":
      return "border-destructive/25 bg-destructive/10 text-destructive";

    case "processing":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";

    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}


export function ResultsWorkspace({
  transformationId,
}: ResultsWorkspaceProps) {
  const query =
    useQuery({
      queryKey: [
        "transformation",
        transformationId,
      ],

      queryFn: () =>
        getTransformation(
          transformationId
        ),
    });


  const [
    activeOutputId,
    setActiveOutputId,
  ] =
    useState<
      string | null
    >(
      null
    );


  const outputs =
    useMemo(
      () =>
        query.data
          ?.outputs ??
        [],

      [
        query.data
          ?.outputs,
      ]
    );


  const activeOutput =
    useMemo(
      () => {
        if (
          !outputs.length
        ) {
          return null;
        }


        if (
          activeOutputId
        ) {
          const found =
            outputs.find(
              (
                item
              ) =>
                item.id ===
                activeOutputId
            );


          if (
            found
          ) {
            return found;
          }
        }


        return outputs[0];
      },

      [
        outputs,
        activeOutputId,
      ]
    );


  const availableOutputTypes =
    useMemo(
      () =>
        outputs
          .map(
            (
              output
            ) =>
              output.output_type
          )
          .filter(
            (
              outputType
            ): outputType is OutputType =>
              Boolean(
                outputType
              )
          ),

      [
        outputs,
      ]
    );


  async function copyActiveOutput() {
    if (
      !activeOutput
    ) {
      return;
    }


    const content =
      activeOutput.content_json ??
      activeOutput.content ??
      {};


    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          content,
          null,
          2
        )
      );


      toast.success(
        "Output copied to clipboard."
      );
    } catch {
      toast.error(
        "Could not copy output."
      );
    }
  }


  if (
    query.isLoading
  ) {
    return (
      <ResultsSkeleton />
    );
  }


  if (
    query.isError ||
    !query.data
  ) {
    return (
      <Alert variant="destructive">
        <FileText className="size-4" />

        <AlertTitle>
          Could not load transformation
        </AlertTitle>

        <AlertDescription>
          {getApiErrorMessage(
            query.error
          )}
        </AlertDescription>
      </Alert>
    );
  }


  const transformation =
    query.data;


  const analysis =
    transformation.analysis ??
    {};


  const keyTopics =
    Array.isArray(
      analysis.key_topics
    )
      ? analysis.key_topics.filter(
          (
            item
          ): item is string =>
            typeof item ===
            "string"
        )
      : [];


  const evidenceCount =
    Array.isArray(
      analysis.evidence
    )
      ? analysis.evidence.length
      : 0;


  const metricsCount =
    Array.isArray(
      analysis.metrics
    )
      ? analysis.metrics.length
      : 0;


  const activeMeta =
    activeOutput
      ? OUTPUT_META[
          activeOutput.output_type
        ]
      : null;


  return (
    <div className="mx-auto max-w-[1500px] space-y-6 lg:space-y-7">
      {/* =====================================================
          BACK
          ===================================================== */}

      <Link
        href="/transform"
        className={cn(
          buttonVariants({
            variant:
              "ghost",

            size:
              "sm",
          }),

          "-ml-2"
        )}
      >
        <ArrowLeft className="size-4" />

        Transform Studio
      </Link>


      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        className={[
          "relative",
          "overflow-hidden",

          "rounded-[1.75rem]",

          "border",
          "border-primary/15",

          "bg-gradient-to-br",
          "from-primary/10",
          "via-card/90",
          "to-card",

          "p-6",

          "shadow-[0_28px_85px_-58px_rgba(0,0,0,0.6)]",

          "sm:p-7",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none",
            "absolute",
            "-right-32",
            "-top-36",

            "size-96",

            "rounded-full",

            "bg-primary/12",
            "blur-[90px]",
          ].join(" ")}
        />


        <div
          className={[
            "relative",

            "flex",
            "flex-col",
            "justify-between",
            "gap-6",

            "lg:flex-row",
            "lg:items-end",
          ].join(" ")}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border",

                  statusClass(
                    transformation.status
                  )
                )}
              >
                <CheckCircle2 className="mr-1.5 size-3" />

                {humanize(
                  transformation.status
                )}
              </Badge>


              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary"
              >
                <Languages className="mr-1.5 size-3" />

                {
                  transformation.language
                }
              </Badge>


              <Badge
                variant="outline"
                className="border-border/70 bg-background/50 text-muted-foreground"
              >
                {
                  outputs.length
                }{" "}
                output
                {outputs.length ===
                1
                  ? ""
                  : "s"}
              </Badge>
            </div>


            <h1
              className={[
                "mt-5",
                "max-w-4xl",
                "break-words",

                "text-3xl",
                "font-bold",
                "tracking-[-0.045em]",

                "sm:text-4xl",
              ].join(" ")}
            >
              {transformation.title ??
                "Transformation Results"}
            </h1>


            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Your source intelligence has been transformed into
              audience-ready communication while preserving the
              configured objective, tone and output requirements.
            </p>


            <div
              className={[
                "mt-5",

                "flex",
                "flex-wrap",
                "gap-2",
              ].join(" ")}
            >
              <span
                className={[
                  "flex",
                  "items-center",
                  "gap-2",

                  "rounded-full",

                  "border",
                  "border-border/70",

                  "bg-background/50",

                  "px-3",
                  "py-1.5",

                  "text-[11px]",
                  "font-medium",
                ].join(" ")}
              >
                <Users className="size-3.5 text-primary" />

                {transformation.target_audience ??
                  "General"}
              </span>


              <span
                className={[
                  "flex",
                  "items-center",
                  "gap-2",

                  "rounded-full",

                  "border",
                  "border-border/70",

                  "bg-background/50",

                  "px-3",
                  "py-1.5",

                  "text-[11px]",
                  "font-medium",
                ].join(" ")}
              >
                <Sparkles className="size-3.5 text-primary" />

                {transformation.tone ??
                  "Professional"}
              </span>


              <span
                className={[
                  "flex",
                  "items-center",
                  "gap-2",

                  "rounded-full",

                  "border",
                  "border-border/70",

                  "bg-background/50",

                  "px-3",
                  "py-1.5",

                  "text-[11px]",
                  "font-medium",
                ].join(" ")}
              >
                <BrainCircuit className="size-3.5 text-primary" />

                {humanize(
                  transformation.detail_level ??
                    "balanced"
                )}
              </span>
            </div>
          </div>


          <div className="flex flex-col gap-2 sm:flex-row">
            {transformation.document_id && (
              <Link
                href={`/documents/${transformation.document_id}`}
                className={cn(
                  buttonVariants({
                    variant:
                      "outline",

                    size:
                      "lg",
                  }),

                  "h-11"
                )}
              >
                <FileText className="size-4" />

                View Source
              </Link>
            )}


            <Button
              type="button"
              size="lg"
              className="h-11"
              disabled={
                !activeOutput
              }
              onClick={
                copyActiveOutput
              }
            >
              <Clipboard className="size-4" />

              Copy Output
            </Button>
          </div>
        </div>
      </section>


      {/* =====================================================
          OBJECTIVE
          ===================================================== */}

      {transformation.objective && (
        <div
          className={[
            "flex",
            "items-start",
            "gap-3",

            "rounded-2xl",

            "border",
            "border-primary/15",

            "bg-primary/5",

            "p-4",

            "sm:p-5",
          ].join(" ")}
        >
          <div className="premium-icon-box flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Target className="size-4" />
          </div>

          <div>
            <p
              className={[
                "text-[10px]",
                "font-bold",
                "uppercase",
                "tracking-[0.12em]",
                "text-primary",
              ].join(" ")}
            >
              Communication Objective
            </p>

            <p className="mt-1.5 text-sm leading-6 text-foreground/90">
              {
                transformation.objective
              }
            </p>
          </div>
        </div>
      )}


      {/* =====================================================
          CONTENT INTELLIGENCE
          ===================================================== */}

      {(
        analysis.one_line_summary ||
        analysis.executive_context ||
        keyTopics.length >
          0 ||
        evidenceCount >
          0 ||
        metricsCount >
          0
      ) && (
        <Card className="premium-card overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-5">
            <div
              className={[
                "flex",
                "flex-col",
                "justify-between",
                "gap-4",

                "sm:flex-row",
                "sm:items-start",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <BrainCircuit className="size-5" />
                </div>

                <div>
                  <CardTitle>
                    Content Intelligence
                  </CardTitle>

                  <CardDescription>
                    Structured understanding produced before the final
                    communication assets were generated.
                  </CardDescription>
                </div>
              </div>


              <div className="flex flex-wrap gap-2">
                {evidenceCount >
                  0 && (
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    <Database className="mr-1.5 size-3" />

                    {
                      evidenceCount
                    }{" "}
                    evidence
                  </Badge>
                )}

                {metricsCount >
                  0 && (
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    {
                      metricsCount
                    }{" "}
                    metrics
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>


          <CardContent className="space-y-5 pt-6">
            {typeof analysis.one_line_summary ===
              "string" && (
              <div
                className={[
                  "rounded-2xl",

                  "border",
                  "border-primary/15",

                  "bg-primary/5",

                  "p-5",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-[10px]",
                    "font-bold",
                    "uppercase",
                    "tracking-[0.12em]",
                    "text-primary",
                  ].join(" ")}
                >
                  Intelligence Summary
                </p>

                <p className="mt-2 text-base font-medium leading-7 tracking-[-0.01em]">
                  {
                    analysis.one_line_summary
                  }
                </p>
              </div>
            )}


            {typeof analysis.executive_context ===
              "string" && (
              <div>
                <p className="text-xs font-semibold">
                  Executive Context
                </p>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {
                    analysis.executive_context
                  }
                </p>
              </div>
            )}


            {keyTopics.length >
              0 && (
              <div>
                <p className="mb-3 text-xs font-semibold">
                  Key Topics
                </p>

                <div className="flex flex-wrap gap-2">
                  {keyTopics.map(
                    (
                      topic
                    ) => (
                      <Badge
                        key={
                          topic
                        }
                        variant="outline"
                        className="border-border/70 bg-background/55 px-3 py-1.5"
                      >
                        {
                          topic
                        }
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {/* =====================================================
          OUTPUT WORKSPACE
          ===================================================== */}

      <section className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)]">
        {/* Output navigation */}

        <Card className="premium-card h-fit overflow-hidden xl:sticky xl:top-[100px]">
          <CardHeader className="border-b border-border/60 pb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  Generated Outputs
                </CardTitle>

                <CardDescription>
                  Select an asset to preview.
                </CardDescription>
              </div>

              <span
                className={[
                  "flex",
                  "size-9",
                  "items-center",
                  "justify-center",

                  "rounded-xl",

                  "border",
                  "border-primary/20",

                  "bg-primary/8",

                  "text-xs",
                  "font-bold",
                  "text-primary",
                ].join(" ")}
              >
                {
                  outputs.length
                }
              </span>
            </div>
          </CardHeader>


          <CardContent className="space-y-2 pt-4">
            {outputs.length ? (
              outputs.map(
                (
                  output,
                  index
                ) => {
                  const active =
                    activeOutput
                      ?.id ===
                    output.id;


                  const meta =
                    OUTPUT_META[
                      output.output_type
                    ];


                  const Icon =
                    meta.icon;


                  return (
                    <button
                      type="button"
                      key={
                        output.id
                      }
                      onClick={() =>
                        setActiveOutputId(
                          output.id
                        )
                      }
                      className={cn(
                        [
                          "group",
                          "relative",
                          "w-full",
                          "overflow-hidden",

                          "rounded-xl",

                          "border",

                          "p-3",
                          "text-left",

                          "transition-all",
                          "duration-200",
                        ].join(" "),

                        active
                          ? [
                              "border-primary/30",
                              "bg-primary/8",

                              "shadow-[0_12px_34px_-28px_var(--primary)]",
                            ].join(" ")
                          : [
                              "border-transparent",
                              "bg-transparent",

                              "hover:border-border/70",
                              "hover:bg-muted/35",
                            ].join(" ")
                      )}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                      )}


                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            [
                              "flex",
                              "size-9",
                              "shrink-0",
                              "items-center",
                              "justify-center",

                              "rounded-lg",

                              "border",

                              "transition-colors",
                            ].join(" "),

                            active
                              ? "border-primary/20 bg-primary text-primary-foreground"
                              : "border-border/70 bg-background/60 text-muted-foreground group-hover:text-primary"
                          )}
                        >
                          <Icon className="size-4" />
                        </span>


                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm font-semibold",

                              active &&
                                "text-primary"
                            )}
                          >
                            {output.title ??
                              meta.label}
                          </span>

                          <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                            {meta.label}
                          </span>
                        </span>


                        <span className="mt-1 text-[9px] font-bold text-muted-foreground/55">
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>
                    </button>
                  );
                }
              )
            ) : (
              <div className="py-10 text-center">
                <FileOutput className="mx-auto size-6 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  No outputs
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  No generated assets are available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Active output */}

        <Card className="premium-card min-w-0 overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-5">
            {activeOutput &&
            activeMeta ? (
              <div
                className={[
                  "flex",
                  "flex-col",
                  "justify-between",
                  "gap-4",

                  "sm:flex-row",
                  "sm:items-start",
                ].join(" ")}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <activeMeta.icon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="break-words">
                      {activeOutput.title ??
                        activeMeta.label}
                    </CardTitle>

                    <CardDescription className="mt-1">
                      {
                        activeMeta.description
                      }
                    </CardDescription>
                  </div>
                </div>


                <Badge
                  variant="outline"
                  className="w-fit shrink-0 border-primary/20 bg-primary/5 text-primary"
                >
                  {humanize(
                    activeOutput.output_type
                  )}
                </Badge>
              </div>
            ) : (
              <CardTitle>
                Generated Output
              </CardTitle>
            )}
          </CardHeader>


          <CardContent className="pt-6">
            {activeOutput ? (
              <ContentViewer
                content={
                  activeOutput.content_json ??
                  activeOutput.content ??
                  {}
                }
              />
            ) : (
              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/15 text-center">
                <FileOutput className="size-7 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  No generated output available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>


      {/* =====================================================
          EXPORT CENTER
          ===================================================== */}

      <ExportCenter
        transformationId={
          transformationId
        }
        availableOutputTypes={
          availableOutputTypes
        }
      />


      {/* =====================================================
          NEXT ACTION
          ===================================================== */}

      <section
        className={[
          "relative",
          "overflow-hidden",

          "rounded-2xl",

          "border",
          "border-primary/20",

          "bg-gradient-to-r",
          "from-primary/8",
          "via-card",
          "to-card",

          "p-5",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/12 blur-3xl" />


        <div
          className={[
            "relative",
            "flex",
            "flex-col",
            "justify-between",
            "gap-5",

            "sm:flex-row",
            "sm:items-center",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
              <WandSparkles className="size-4" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Need another communication format?
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Return to Transform Studio and create another grounded
                transformation from your source library.
              </p>
            </div>
          </div>


          <Link
            href="/transform"
            className={cn(
              buttonVariants({
                variant:
                  "outline",

                size:
                  "lg",
              }),

              "h-11 shrink-0"
            )}
          >
            New Transformation

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}