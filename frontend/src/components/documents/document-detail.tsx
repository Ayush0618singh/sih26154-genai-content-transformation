"use client";

import Link from "next/link";

import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  Database,
  FileText,
  HardDrive,
  Info,
  Layers3,
  LockKeyhole,
  Sparkles,
  Text,
} from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Badge,
} from "@/components/ui/badge";

import {
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
  getDocument,
} from "@/lib/api/documents";

import {
  getApiErrorMessage,
} from "@/lib/api/client";

import {
  cn,
} from "@/lib/utils";

import {
  formatBytes,
  formatDate,
  humanize,
} from "@/lib/utils/format";


interface DocumentDetailProps {
  documentId:
    string;
}


function MetadataViewer({
  metadata,
}: {
  metadata:
    Record<
      string,
      unknown
    >;
}) {
  const entries =
    Object.entries(
      metadata
    );


  if (
    !entries.length
  ) {
    return (
      <div
        className={[
          "rounded-xl",
          "border",
          "border-dashed",
          "border-border",
          "bg-muted/15",
          "p-6",
          "text-center",
        ].join(" ")}
      >
        <Info className="mx-auto size-5 text-primary" />

        <p className="mt-2 text-sm text-muted-foreground">
          No extraction metadata available.
        </p>
      </div>
    );
  }


  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map(
        (
          [
            key,
            value,
          ]
        ) => (
          <div
            key={
              key
            }
            className={[
              "rounded-xl",

              "border",
              "border-border/70",

              "bg-background/45",

              "p-4",

              "transition-colors",

              "hover:border-primary/20",
              "hover:bg-primary/[0.025]",
            ].join(" ")}
          >
            <p
              className={[
                "text-[9px]",
                "font-bold",
                "uppercase",
                "tracking-[0.12em]",
                "text-muted-foreground",
              ].join(" ")}
            >
              {humanize(
                key
              )}
            </p>

            <p className="mt-2 break-words text-sm font-medium leading-6">
              {typeof value ===
                "string" ||
              typeof value ===
                "number" ||
              typeof value ===
                "boolean"
                ? String(
                    value
                  )
                : JSON.stringify(
                    value
                  )}
            </p>
          </div>
        )
      )}
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status:
    string;
}) {
  const ready =
    status.toLowerCase() ===
    "ready";


  const failed =
    status.toLowerCase() ===
    "failed";


  return (
    <Badge
      variant="outline"
      className={cn(
        "border",

        ready &&
          "border-primary/25 bg-primary/10 text-primary",

        failed &&
          "border-destructive/25 bg-destructive/10 text-destructive",

        !ready &&
          !failed &&
          "border-border bg-muted/30 text-muted-foreground"
      )}
    >
      {humanize(
        status
      )}
    </Badge>
  );
}


export function DocumentDetail({
  documentId,
}: DocumentDetailProps) {
  const query =
    useQuery({
      queryKey: [
        "document",
        documentId,
      ],

      queryFn: () =>
        getDocument(
          documentId
        ),
    });


  if (
    query.isLoading
  ) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-28 rounded-xl" />

        <Skeleton className="h-44 rounded-[1.75rem]" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (
              _,
              index
            ) => (
              <Skeleton
                key={
                  index
                }
                className="h-36 rounded-2xl"
              />
            )
          )}
        </div>

        <Skeleton className="h-72 rounded-2xl" />

        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }


  if (
    query.isError ||
    !query.data
  ) {
    return (
      <div
        className={[
          "rounded-2xl",
          "border",
          "border-destructive/30",
          "bg-destructive/5",
          "p-5",
          "text-sm",
          "text-destructive",
        ].join(" ")}
      >
        {getApiErrorMessage(
          query.error
        )}
      </div>
    );
  }


  const document =
    query.data;


  return (
    <div className="mx-auto max-w-[1500px] space-y-6 lg:space-y-7">
      {/* Back */}

      <Link
        href="/documents"
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

        Source Library
      </Link>


      {/* Header */}

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

          "sm:p-7",
        ].join(" ")}
      >
        <div className="pointer-events-none absolute -right-28 -top-28 size-72 rounded-full bg-primary/12 blur-[80px]" />


        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary"
            >
              {humanize(
                document.input_type
              )}
            </Badge>

            <StatusBadge
              status={
                document.status
              }
            />

            {document.rag_status && (
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary"
              >
                <Database className="mr-1.5 size-3" />

                RAG{" "}
                {humanize(
                  document.rag_status
                )}
              </Badge>
            )}
          </div>


          <h1
            className={[
              "mt-4",
              "max-w-4xl",
              "break-words",

              "text-2xl",
              "font-bold",
              "tracking-[-0.04em]",

              "sm:text-3xl",
              "lg:text-4xl",
            ].join(" ")}
          >
            {
              document.original_filename
            }
          </h1>


          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review extracted source intelligence, RAG indexing,
            metadata and processing information used by the
            transformation pipeline.
          </p>
        </div>
      </section>


      {/* KPI Cards */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="premium-card">
          <CardContent className="p-5">
            <div className="premium-icon-box flex size-10 items-center justify-center rounded-xl">
              <HardDrive className="size-5" />
            </div>

            <p className="mt-4 text-xs font-medium text-muted-foreground">
              File size
            </p>

            <p className="mt-1 text-2xl font-bold tracking-[-0.035em]">
              {formatBytes(
                document.file_size
              )}
            </p>
          </CardContent>
        </Card>


        <Card className="premium-card">
          <CardContent className="p-5">
            <div className="premium-icon-box flex size-10 items-center justify-center rounded-xl">
              <Layers3 className="size-5" />
            </div>

            <p className="mt-4 text-xs font-medium text-muted-foreground">
              Pages
            </p>

            <p className="mt-1 text-2xl font-bold tracking-[-0.035em]">
              {
                document.page_count
              }
            </p>
          </CardContent>
        </Card>


        <Card className="premium-card">
          <CardContent className="p-5">
            <div className="premium-icon-box flex size-10 items-center justify-center rounded-xl">
              <Database className="size-5" />
            </div>

            <p className="mt-4 text-xs font-medium text-muted-foreground">
              RAG Index
            </p>

            <p className="mt-1 text-lg font-bold tracking-[-0.025em]">
              {document.rag_status
                ? humanize(
                    document.rag_status
                  )
                : "Not indexed"}
            </p>

            <p className="mt-1 text-[10px] text-muted-foreground">
              {
                document.rag_chunk_count
              }{" "}
              semantic chunks
            </p>
          </CardContent>
        </Card>


        <Card className="premium-card">
          <CardContent className="p-5">
            <div className="premium-icon-box flex size-10 items-center justify-center rounded-xl">
              <Sparkles className="size-5" />
            </div>

            <p className="mt-4 text-xs font-medium text-muted-foreground">
              Transformations
            </p>

            <p className="mt-1 text-2xl font-bold tracking-[-0.035em]">
              {
                document.transformation_count
              }
            </p>
          </CardContent>
        </Card>
      </section>


      {/* Information */}

      <Card className="premium-card">
        <CardHeader className="border-b border-border/60 pb-5">
          <div className="flex items-start gap-3">
            <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Info className="size-4" />
            </div>

            <div>
              <CardTitle>
                Source Information
              </CardTitle>

              <CardDescription>
                Processing, extraction and storage details.
              </CardDescription>
            </div>
          </div>
        </CardHeader>


        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              icon:
                FileText,

              label:
                "MIME Type",

              value:
                document.mime_type,
            },

            {
              icon:
                BrainCircuit,

              label:
                "Extraction Method",

              value:
                document.extraction_method
                  ? humanize(
                      document.extraction_method
                    )
                  : "—",
            },

            {
              icon:
                Text,

              label:
                "Extracted Characters",

              value:
                document.character_count.toLocaleString(
                  "en-IN"
                ),
            },

            {
              icon:
                CalendarDays,

              label:
                "Created",

              value:
                formatDate(
                  document.created_at
                ),
            },

            {
              icon:
                CalendarDays,

              label:
                "Last Updated",

              value:
                formatDate(
                  document.updated_at
                ),
            },

            {
              icon:
                LockKeyhole,

              label:
                "Storage",

              value:
                document.storage_path
                  ? "Private storage"
                  : "Direct text source",
            },
          ].map(
            (
              item
            ) => {
              const Icon =
                item.icon;


              return (
                <div
                  key={
                    item.label
                  }
                  className={[
                    "flex",
                    "items-start",
                    "gap-3",

                    "rounded-xl",

                    "border",
                    "border-border/70",

                    "bg-background/40",

                    "p-4",
                  ].join(" ")}
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />

                  <div className="min-w-0">
                    <p
                      className={[
                        "text-[9px]",
                        "font-bold",
                        "uppercase",
                        "tracking-[0.12em]",
                        "text-muted-foreground",
                      ].join(" ")}
                    >
                      {
                        item.label
                      }
                    </p>

                    <p className="mt-1.5 break-all text-sm font-semibold">
                      {
                        item.value
                      }
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </CardContent>
      </Card>


      {/* Extracted content */}

      <Card className="premium-card">
        <CardHeader className="border-b border-border/60 pb-5">
          <div className="flex items-start gap-3">
            <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Text className="size-4" />
            </div>

            <div>
              <CardTitle>
                Extracted Content
              </CardTitle>

              <CardDescription>
                Normalized source text consumed by AI analysis and
                semantic retrieval.
              </CardDescription>
            </div>
          </div>
        </CardHeader>


        <CardContent className="pt-6">
          {document.extracted_text ? (
            <div
              className={[
                "relative",
                "max-h-[650px]",
                "overflow-auto",

                "rounded-2xl",

                "border",
                "border-border/70",

                "bg-muted/15",

                "p-5",
              ].join(" ")}
            >
              <pre
                className={[
                  "whitespace-pre-wrap",
                  "break-words",
                  "font-sans",

                  "text-sm",
                  "leading-7",
                  "text-foreground/90",
                ].join(" ")}
              >
                {
                  document.extracted_text
                }
              </pre>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/15 p-8 text-center">
              <Text className="mx-auto size-5 text-primary" />

              <p className="mt-2 text-sm text-muted-foreground">
                No extracted text available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Metadata */}

      <Card className="premium-card">
        <CardHeader className="border-b border-border/60 pb-5">
          <CardTitle>
            Extraction Metadata
          </CardTitle>

          <CardDescription>
            Additional structured metadata detected during ingestion.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <MetadataViewer
            metadata={
              document.metadata
            }
          />
        </CardContent>
      </Card>


      {/* Error */}

      {document.error_message && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="border-b border-destructive/15">
            <CardTitle className="text-destructive">
              Processing Error
            </CardTitle>

            <CardDescription>
              The source pipeline reported the following error.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            <p className="text-sm leading-6 text-destructive">
              {
                document.error_message
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}