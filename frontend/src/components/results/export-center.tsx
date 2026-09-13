"use client";

import {
  useState,
} from "react";

import {
  Download,
  FileArchive,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  generateExports,
  getExportDownloadUrl,
  getExports,
  deleteExport,
} from "@/lib/api/exports";

import {
  getApiErrorMessage,
} from "@/lib/api/client";

import {
  cn,
} from "@/lib/utils";

import {
  formatBytes,
  humanize,
} from "@/lib/utils/format";

import type {
  ExportFormat,
  OutputType,
} from "@/types/api";


const EXPORT_FORMATS:
  ExportFormat[] = [
    "pdf",
    "docx",
    "pptx",
    "json",
    "csv",
    "srt",
  ];


interface ExportCenterProps {
  transformationId: string;

  availableOutputTypes:
    OutputType[];
}


export function ExportCenter({
  transformationId,
  availableOutputTypes,
}: ExportCenterProps) {
  const queryClient =
    useQueryClient();

  const [
    selectedFormats,
    setSelectedFormats,
  ] =
    useState<ExportFormat[]>(
      [
        "pdf",
        "docx",
        "pptx",
      ]
    );


  const exportsQuery =
    useQuery({
      queryKey: [
        "exports",
        transformationId,
      ],

      queryFn: () =>
        getExports(
          transformationId
        ),
    });


  const generateMutation =
    useMutation({
      mutationFn:
        () =>
          generateExports(
            transformationId,
            {
              formats:
                selectedFormats,

              include_output_types:
                null,
            }
          ),

      onSuccess:
        async () => {
          toast.success(
            "Exports generated successfully."
          );

          await queryClient.invalidateQueries(
            {
              queryKey: [
                "exports",
                transformationId,
              ],
            }
          );
        },

      onError:
        (
          error
        ) =>
          toast.error(
            getApiErrorMessage(
              error
            )
          ),
    });


  const deleteMutation =
    useMutation({
      mutationFn:
        deleteExport,

      onSuccess:
        async () => {
          toast.success(
            "Export deleted."
          );

          await queryClient.invalidateQueries(
            {
              queryKey: [
                "exports",
                transformationId,
              ],
            }
          );
        },

      onError:
        (
          error
        ) =>
          toast.error(
            getApiErrorMessage(
              error
            )
          ),
    });


  function toggleFormat(
    format:
      ExportFormat
  ) {
    if (
      format ===
        "srt" &&
      !availableOutputTypes.includes(
        "video_script"
      )
    ) {
      toast.error(
        "Generate a Video Script output before creating SRT captions."
      );

      return;
    }

    if (
      selectedFormats.includes(
        format
      )
    ) {
      setSelectedFormats(
        selectedFormats.filter(
          (
            item
          ) =>
            item !==
            format
        )
      );

      return;
    }

    setSelectedFormats([
      ...selectedFormats,
      format,
    ]);
  }


  async function download(
    exportId: string
  ) {
    try {
      const result =
        await getExportDownloadUrl(
          exportId
        );

      window.open(
        result.signed_url,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error
        )
      );
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="size-5" />

          Export Center
        </CardTitle>

        <CardDescription>
          Convert the AI-generated
          content into professional
          downloadable artifacts.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {EXPORT_FORMATS.map(
            (
              format
            ) => {
              const disabled =
                format ===
                  "srt" &&
                !availableOutputTypes.includes(
                  "video_script"
                );

              const selected =
                selectedFormats.includes(
                  format
                );

              return (
                <button
                  key={
                    format
                  }
                  type="button"
                  disabled={
                    disabled
                  }
                  onClick={() =>
                    toggleFormat(
                      format
                    )
                  }
                  className={cn(
                    "rounded-xl border px-3 py-3 text-xs font-semibold uppercase transition-colors",
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted",
                    disabled &&
                      "cursor-not-allowed opacity-40"
                  )}
                >
                  {format}
                </button>
              );
            }
          )}
        </div>

        <Button
          type="button"
          disabled={
            selectedFormats.length ===
              0 ||
            generateMutation.isPending
          }
          onClick={() =>
            generateMutation.mutate()
          }
        >
          {generateMutation.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Download className="mr-2 size-4" />
          )}

          Generate Selected
          Exports
        </Button>


        {exportsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading exports...
          </p>
        ) : exportsQuery.data
            ?.artifacts
            .length ? (
          <div className="space-y-2">
            {exportsQuery.data.artifacts.map(
              (
                artifact
              ) => (
                <div
                  key={
                    artifact.id
                  }
                  className="flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {
                          artifact.filename
                        }
                      </p>

                      <Badge variant="secondary">
                        {humanize(
                          artifact.export_format
                        )}
                      </Badge>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatBytes(
                        artifact.file_size
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        download(
                          artifact.id
                        )
                      }
                    >
                      <Download className="mr-2 size-3.5" />

                      Download
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={
                        deleteMutation.isPending
                      }
                      onClick={() =>
                        deleteMutation.mutate(
                          artifact.id
                        )
                      }
                      aria-label="Delete export"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No downloadable exports
            have been generated yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}