"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  FileText,
  Sparkles,
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
    useState<string | null>(
      null
    );


  const outputs =
    useMemo(
      () =>
        query.data?.outputs ??
        [],
      [
        query.data?.outputs,
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

          if (found) {
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
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />

        <Skeleton className="h-28" />

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-96" />

          <Skeleton className="h-96" />
        </div>
      </div>
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
          Could not load
          transformation
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


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link
            href="/transform"
            className={cn(
              buttonVariants({
                variant:
                  "ghost",
                size:
                  "sm",
              }),
              "-ml-3 mb-2"
            )}
          >
            <ArrowLeft className="mr-2 size-4" />

            Transform Studio
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1"
            >
              <CheckCircle2 className="size-3" />

              Completed
            </Badge>

            <Badge variant="outline">
              {
                transformation.language
              }
            </Badge>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {transformation.title ??
              "Transformation Results"}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Audience:{" "}
            <span className="font-medium text-foreground">
              {transformation.target_audience ??
                "General"}
            </span>
            {" · "}
            Tone:{" "}
            <span className="font-medium text-foreground">
              {transformation.tone ??
                "Professional"}
            </span>
            {" · "}
            Detail:{" "}
            <span className="font-medium text-foreground">
              {humanize(
                transformation.detail_level ??
                  "balanced"
              )}
            </span>
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={
            !activeOutput
          }
          onClick={
            copyActiveOutput
          }
        >
          <Clipboard className="mr-2 size-4" />

          Copy Output
        </Button>
      </div>


      {(
        analysis.one_line_summary ||
        analysis.executive_context ||
        keyTopics.length >
          0
      ) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />

              Content
              Intelligence
            </CardTitle>

            <CardDescription>
              Structured understanding
              extracted before the
              transformation outputs
              were generated.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {typeof analysis.one_line_summary ===
              "string" && (
              <p className="text-sm leading-7">
                {
                  analysis.one_line_summary
                }
              </p>
            )}

            {typeof analysis.executive_context ===
              "string" && (
              <p className="text-sm leading-7 text-muted-foreground">
                {
                  analysis.executive_context
                }
              </p>
            )}

            {keyTopics.length >
              0 && (
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
                    >
                      {
                        topic
                      }
                    </Badge>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}


      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">
              Generated Outputs
            </CardTitle>

            <CardDescription>
              {outputs.length}{" "}
              result
              {outputs.length !==
              1
                ? "s"
                : ""}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {outputs.map(
              (
                output
              ) => {
                const active =
                  activeOutput?.id ===
                  output.id;

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
                      "w-full rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <p className="font-semibold">
                      {output.title ??
                        humanize(
                          output.output_type
                        )}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {humanize(
                        output.output_type
                      )}
                    </p>
                  </button>
                );
              }
            )}
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>
              {activeOutput?.title ??
                (
                  activeOutput
                    ? humanize(
                        activeOutput.output_type
                      )
                    : "Output"
                )}
            </CardTitle>

            {activeOutput && (
              <CardDescription>
                {humanize(
                  activeOutput.output_type
                )}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {activeOutput ? (
              <ContentViewer
                content={
                  activeOutput.content_json ??
                  activeOutput.content ??
                  {}
                }
              />
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No generated output
                available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      <ExportCenter
        transformationId={
          transformationId
        }
        availableOutputTypes={
          availableOutputTypes
        }
      />
    </div>
  );
}