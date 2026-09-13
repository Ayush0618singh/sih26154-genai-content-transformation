"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Database,
  FileText,
  Layers3,
  Sparkles,
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
  documentId: string;
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
      <p className="text-sm text-muted-foreground">
        No metadata available.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
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
            className="rounded-xl border bg-muted/20 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {humanize(
                key
              )}
            </p>

            <p className="mt-2 break-words text-sm">
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
      <div className="space-y-5">
        <Skeleton className="h-10 w-80" />

        <Skeleton className="h-40" />

        <Skeleton className="h-96" />
      </div>
    );
  }


  if (
    query.isError ||
    !query.data
  ) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
        {getApiErrorMessage(
          query.error
        )}
      </div>
    );
  }


  const document =
    query.data;


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Link
          href="/documents"
          className={cn(
            buttonVariants({
              variant:
                "ghost",
              size:
                "sm",
            }),
            "-ml-3"
          )}
        >
          <ArrowLeft className="mr-2 size-4" />

          Documents
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {humanize(
              document.input_type
            )}
          </Badge>

          <Badge
            variant={
              document.status ===
              "ready"
                ? "secondary"
                : "outline"
            }
          >
            {
              document.status
            }
          </Badge>
        </div>

        <h1 className="mt-3 break-words text-3xl font-bold tracking-tight">
          {
            document.original_filename
          }
        </h1>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <FileText className="size-5 text-primary" />

            <p className="mt-4 text-xs text-muted-foreground">
              File size
            </p>

            <p className="mt-1 text-xl font-bold">
              {formatBytes(
                document.file_size
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Layers3 className="size-5 text-primary" />

            <p className="mt-4 text-xs text-muted-foreground">
              Pages
            </p>

            <p className="mt-1 text-xl font-bold">
              {
                document.page_count
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Database className="size-5 text-primary" />

            <p className="mt-4 text-xs text-muted-foreground">
              RAG index
            </p>

            <p className="mt-1 text-xl font-bold">
              {document.rag_status
                ? humanize(
                    document.rag_status
                  )
                : "Not indexed"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {
                document.rag_chunk_count
              }{" "}
              chunks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Sparkles className="size-5 text-primary" />

            <p className="mt-4 text-xs text-muted-foreground">
              Transformations
            </p>

            <p className="mt-1 text-xl font-bold">
              {
                document.transformation_count
              }
            </p>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>
            Document Information
          </CardTitle>

          <CardDescription>
            Extraction and processing details.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">
              MIME type
            </p>

            <p className="mt-1 break-all text-sm font-medium">
              {
                document.mime_type
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Extraction method
            </p>

            <p className="mt-1 text-sm font-medium">
              {document.extraction_method
                ? humanize(
                    document.extraction_method
                  )
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Characters
            </p>

            <p className="mt-1 text-sm font-medium">
              {document.character_count.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Created
            </p>

            <p className="mt-1 text-sm font-medium">
              {formatDate(
                document.created_at
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Updated
            </p>

            <p className="mt-1 text-sm font-medium">
              {formatDate(
                document.updated_at
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Storage
            </p>

            <p className="mt-1 text-sm font-medium">
              {document.storage_path
                ? "Private storage"
                : "Direct text"}
            </p>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>
            Extracted Content
          </CardTitle>

          <CardDescription>
            Normalized text used by the AI and RAG pipeline.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {document.extracted_text ? (
            <div className="max-h-[650px] overflow-auto rounded-xl border bg-muted/20 p-5">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7">
                {
                  document.extracted_text
                }
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No extracted text available.
            </p>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>
            Extraction Metadata
          </CardTitle>
        </CardHeader>

        <CardContent>
          <MetadataViewer
            metadata={
              document.metadata
            }
          />
        </CardContent>
      </Card>


      {document.error_message && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">
              Processing Error
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-destructive">
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