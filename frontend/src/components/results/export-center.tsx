"use client";

import {
  useState,
} from "react";

import {
  Check,
  Download,
  FileArchive,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileType,
  Loader2,
  Presentation,
  ShieldCheck,
  Subtitles,
  Trash2,
} from "lucide-react";

import type {
  LucideIcon,
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
  Skeleton,
} from "@/components/ui/skeleton";

import {
  deleteExport,
  generateExports,
  getExportDownloadUrl,
  getExports,
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


interface ExportFormatMeta {
  format:
    ExportFormat;

  label:
    string;

  description:
    string;

  icon:
    LucideIcon;
}


const EXPORT_FORMATS:
  ExportFormatMeta[] = [
    {
      format:
        "pdf",

      label:
        "PDF",

      description:
        "Portable professional report",

      icon:
        FileText,
    },

    {
      format:
        "docx",

      label:
        "DOCX",

      description:
        "Editable Word document",

      icon:
        FileType,
    },

    {
      format:
        "pptx",

      label:
        "PPTX",

      description:
        "Presentation deck",

      icon:
        Presentation,
    },

    {
      format:
        "json",

      label:
        "JSON",

      description:
        "Structured machine-readable data",

      icon:
        FileJson,
    },

    {
      format:
        "csv",

      label:
        "CSV",

      description:
        "Tabular structured export",

      icon:
        FileSpreadsheet,
    },

    {
      format:
        "srt",

      label:
        "SRT",

      description:
        "Video caption file",

      icon:
        Subtitles,
    },
  ];


interface ExportCenterProps {
  transformationId:
    string;

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
    useState<
      ExportFormat[]
    >([
      "pdf",
      "docx",
      "pptx",
    ]);


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
      mutationFn: () =>
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


          await queryClient.invalidateQueries(
            {
              queryKey: [
                "dashboard",
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


          await queryClient.invalidateQueries(
            {
              queryKey: [
                "dashboard",
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
    exportId:
      string
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


  function removeExport(
    exportId:
      string,
    filename:
      string
  ) {
    const confirmed =
      window.confirm(
        `Delete "${filename}" from generated exports?`
      );


    if (
      !confirmed
    ) {
      return;
    }


    deleteMutation.mutate(
      exportId
    );
  }


  const artifacts =
    exportsQuery.data
      ?.artifacts ??
    [];


  return (
    <Card className="premium-card overflow-hidden">
      {/* =====================================================
          HEADER
          ===================================================== */}

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
            <div className="premium-icon-box flex size-11 shrink-0 items-center justify-center rounded-xl">
              <FileArchive className="size-5" />
            </div>

            <div>
              <CardTitle>
                Export Center
              </CardTitle>

              <CardDescription className="mt-1">
                Convert generated intelligence into professional,
                downloadable deliverables.
              </CardDescription>
            </div>
          </div>


          <div
            className={[
              "flex",
              "items-center",
              "gap-2",

              "rounded-full",

              "border",
              "border-primary/20",

              "bg-primary/5",

              "px-3",
              "py-1.5",

              "text-[10px]",
              "font-bold",
              "uppercase",
              "tracking-[0.08em]",
              "text-primary",
            ].join(" ")}
          >
            <ShieldCheck className="size-3.5" />

            Signed Downloads
          </div>
        </div>
      </CardHeader>


      <CardContent className="space-y-7 pt-6">
        {/* =====================================================
            FORMAT SELECTOR
            ===================================================== */}

        <div>
          <div className="mb-4">
            <p className="text-sm font-semibold">
              Choose export formats
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Select one or more formats. Existing export files can
              still be downloaded below.
            </p>
          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {EXPORT_FORMATS.map(
              (
                item
              ) => {
                const disabled =
                  item.format ===
                    "srt" &&
                  !availableOutputTypes.includes(
                    "video_script"
                  );


                const selected =
                  selectedFormats.includes(
                    item.format
                  );


                const Icon =
                  item.icon;


                return (
                  <button
                    key={
                      item.format
                    }
                    type="button"
                    disabled={
                      disabled
                    }
                    onClick={() =>
                      toggleFormat(
                        item.format
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

                        "transition-all",
                        "duration-250",
                      ].join(" "),

                      selected
                        ? [
                            "border-primary/35",
                            "bg-primary/8",

                            "-translate-y-0.5",

                            "shadow-[0_16px_42px_-32px_var(--primary)]",
                          ].join(" ")
                        : [
                            "border-border/70",
                            "bg-background/40",

                            "hover:-translate-y-0.5",
                            "hover:border-primary/25",
                            "hover:bg-primary/4",
                          ].join(" "),

                      disabled &&
                        "cursor-not-allowed opacity-40"
                    )}
                  >
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

                        selected
                          ? "border-primary/20 bg-primary text-primary-foreground"
                          : "border-border/70 bg-muted/40 text-muted-foreground group-hover:text-primary"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>


                    <p
                      className={cn(
                        "mt-4 text-sm font-bold",

                        selected &&
                          "text-primary"
                      )}
                    >
                      {
                        item.label
                      }
                    </p>


                    <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                      {
                        item.description
                      }
                    </p>


                    <span
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
                        ].join(" "),

                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-transparent"
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                  </button>
                );
              }
            )}
          </div>


          {!availableOutputTypes.includes(
            "video_script"
          ) && (
            <p className="mt-3 text-[10px] text-muted-foreground">
              SRT export becomes available when the transformation
              includes a Video Script output.
            </p>
          )}
        </div>


        {/* =====================================================
            GENERATE BUTTON
            ===================================================== */}

        <div
          className={[
            "flex",
            "flex-col",
            "justify-between",
            "gap-4",

            "rounded-2xl",

            "border",
            "border-primary/15",

            "bg-primary/5",

            "p-4",

            "sm:flex-row",
            "sm:items-center",
          ].join(" ")}
        >
          <div>
            <p className="text-sm font-semibold">
              {selectedFormats.length}{" "}
              format
              {selectedFormats.length ===
              1
                ? ""
                : "s"}{" "}
              selected
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Export files are generated from the completed AI
              outputs.
            </p>
          </div>


          <Button
            type="button"
            size="lg"
            className="h-11 shrink-0"
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
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}

            Generate Selected Exports
          </Button>
        </div>


        {/* =====================================================
            ARTIFACTS
            ===================================================== */}

        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Generated Files
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Download or remove previously generated artifacts.
              </p>
            </div>


            {artifacts.length >
              0 && (
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary"
              >
                {
                  artifacts.length
                }{" "}
                FILE
                {artifacts.length ===
                1
                  ? ""
                  : "S"}
              </Badge>
            )}
          </div>


          {exportsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({
                length: 3,
              }).map(
                (
                  _,
                  index
                ) => (
                  <Skeleton
                    key={
                      index
                    }
                    className="h-[78px] rounded-xl"
                  />
                )
              )}
            </div>
          ) : exportsQuery.isError ? (
            <div
              className={[
                "rounded-xl",

                "border",
                "border-destructive/30",

                "bg-destructive/5",

                "p-4",

                "text-sm",
                "text-destructive",
              ].join(" ")}
            >
              {getApiErrorMessage(
                exportsQuery.error
              )}
            </div>
          ) : artifacts.length ? (
            <div className="grid gap-3">
              {artifacts.map(
                (
                  artifact
                ) => (
                  <div
                    key={
                      artifact.id
                    }
                    className={[
                      "group",

                      "flex",
                      "flex-col",
                      "justify-between",
                      "gap-4",

                      "rounded-2xl",

                      "border",
                      "border-border/70",

                      "bg-background/45",

                      "p-4",

                      "transition-all",
                      "duration-200",

                      "hover:border-primary/20",
                      "hover:bg-primary/[0.025]",

                      "sm:flex-row",
                      "sm:items-center",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
                        <Download className="size-4" />
                      </div>


                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="max-w-[560px] truncate text-sm font-semibold">
                            {
                              artifact.filename
                            }
                          </p>

                          <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/5 text-[9px] font-bold text-primary"
                          >
                            {humanize(
                              artifact.export_format
                            )}
                          </Badge>
                        </div>

                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatBytes(
                            artifact.file_size
                          )}
                          {" · "}
                          {
                            artifact.mime_type
                          }
                        </p>
                      </div>
                    </div>


                    <div className="flex shrink-0 items-center gap-2">
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
                        <Download className="size-3.5" />

                        Download
                      </Button>


                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={
                          deleteMutation.isPending
                        }
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          removeExport(
                            artifact.id,
                            artifact.filename
                          )
                        }
                        aria-label="Delete export"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div
              className={[
                "rounded-2xl",

                "border",
                "border-dashed",
                "border-border",

                "bg-muted/15",

                "px-5",
                "py-12",

                "text-center",
              ].join(" ")}
            >
              <FileArchive className="mx-auto size-7 text-primary" />

              <h3 className="mt-3 text-sm font-semibold">
                No exports generated yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                Select one or more formats above and generate your
                downloadable files.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}