"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Eye,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Film,
  Filter,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
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
  Input,
} from "@/components/ui/input";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  deleteDocument,
  getDocuments,
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


const inputTypes = [
  "",
  "pdf",
  "docx",
  "text",
  "image",
  "video",
  "csv",
  "xlsx",
  "json",
];


const statuses = [
  "",
  "ready",
  "processing",
  "failed",
];


const selectClassName = [
  "h-11",
  "min-w-[150px]",
  "appearance-none",
  "rounded-xl",
  "border",
  "border-input",
  "bg-background/60",
  "px-3.5",
  "pr-10",
  "text-sm",
  "font-medium",
  "outline-none",
  "transition-all",
  "duration-200",
  "hover:border-primary/30",
  "focus:border-primary/50",
  "focus:ring-4",
  "focus:ring-primary/10",
].join(" ");


function getDocumentIcon(
  type: string
): LucideIcon {
  switch (
    type.toLowerCase()
  ) {
    case "image":
      return FileImage;

    case "video":
      return Film;

    case "csv":
    case "xlsx":
    case "json":
      return FileSpreadsheet;

    case "pdf":
    case "docx":
    case "text":
      return FileText;

    default:
      return FileArchive;
  }
}


function documentStatusClass(
  status: string
) {
  switch (
    status.toLowerCase()
  ) {
    case "ready":
      return "border-primary/25 bg-primary/10 text-primary";

    case "processing":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";

    case "failed":
      return "border-destructive/25 bg-destructive/10 text-destructive";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}


export function DocumentsPage() {
  const queryClient =
    useQueryClient();


  const [
    page,
    setPage,
  ] = useState(1);


  const [
    searchInput,
    setSearchInput,
  ] = useState("");


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    inputType,
    setInputType,
  ] = useState("");


  const [
    status,
    setStatus,
  ] = useState("");


  const documentsQuery =
    useQuery({
      queryKey: [
        "documents",
        page,
        search,
        inputType,
        status,
      ],

      queryFn: () =>
        getDocuments({
          page,

          pageSize:
            20,

          search:
            search ||
            undefined,

          inputType:
            inputType ||
            undefined,

          status:
            status ||
            undefined,
        }),
    });


  const deleteMutation =
    useMutation({
      mutationFn:
        deleteDocument,

      onSuccess:
        async () => {
          toast.success(
            "Document deleted."
          );

          await queryClient.invalidateQueries(
            {
              queryKey: [
                "documents",
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
        ) => {
          toast.error(
            getApiErrorMessage(
              error
            )
          );
        },
    });


  function submitSearch(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPage(
      1
    );

    setSearch(
      searchInput.trim()
    );
  }


  function resetFilters() {
    setPage(
      1
    );

    setSearchInput(
      ""
    );

    setSearch(
      ""
    );

    setInputType(
      ""
    );

    setStatus(
      ""
    );
  }


  function removeDocument(
    documentId: string,
    filename: string
  ) {
    const confirmed =
      window.confirm(
        `Delete "${filename}"?\n\nThis will also delete its transformations, exports and RAG index.`
      );


    if (
      !confirmed
    ) {
      return;
    }


    deleteMutation.mutate(
      documentId
    );
  }


  const data =
    documentsQuery.data;


  const activeFilters =
    [
      search,
      inputType,
      status,
    ].filter(
      Boolean
    ).length;


  return (
    <div className="mx-auto max-w-[1500px] space-y-6 lg:space-y-7">
      {/* =====================================================
          HEADER
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
        <div className="pointer-events-none absolute -right-28 -top-28 size-72 rounded-full bg-primary/12 blur-[80px]" />


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
          <div>
            <div className="premium-kicker">
              <FileArchive className="size-3.5" />

              Source Intelligence Library
            </div>

            <h1
              className={[
                "mt-4",
                "text-3xl",
                "font-bold",
                "tracking-[-0.045em]",
                "sm:text-4xl",
              ].join(" ")}
            >
              Documents
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage every source used by TransformAI — documents,
              images, structured data, direct text and video content.
            </p>
          </div>


          <Link
            href="/transform"
            className={cn(
              buttonVariants({
                size:
                  "lg",
              }),

              "h-11"
            )}
          >
            <UploadCloud className="size-4" />

            Add New Source

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>


      {/* =====================================================
          FILTER BAR
          ===================================================== */}

      <Card className="premium-card overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-5">
          <div
            className={[
              "flex",
              "flex-col",
              "justify-between",
              "gap-4",

              "sm:flex-row",
              "sm:items-center",
            ].join(" ")}
          >
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>
                  Source Library
                </CardTitle>

                {data && (
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    {data.pagination.total.toLocaleString(
                      "en-IN"
                    )}{" "}
                    SOURCES
                  </Badge>
                )}
              </div>

              <CardDescription className="mt-1">
                Search, filter and manage processed source content.
              </CardDescription>
            </div>


            {activeFilters >
              0 && (
              <Badge
                variant="outline"
                className="w-fit border-primary/20 bg-primary/5 text-primary"
              >
                <Filter className="mr-1.5 size-3" />

                {
                  activeFilters
                }{" "}
                active
                filter
                {activeFilters ===
                1
                  ? ""
                  : "s"}
              </Badge>
            )}
          </div>
        </CardHeader>


        <CardContent className="space-y-5 pt-6">
          <form
            onSubmit={
              submitSearch
            }
            className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto_auto]"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search source filename..."
                className="h-11 rounded-xl bg-background/60 pl-10"
                value={
                  searchInput
                }
                onChange={(
                  event
                ) =>
                  setSearchInput(
                    event.target
                      .value
                  )
                }
              />
            </div>


            <div className="relative">
              <select
                value={
                  inputType
                }
                aria-label="Filter by source type"
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) => {
                  setPage(
                    1
                  );

                  setInputType(
                    event.target
                      .value
                  );
                }}
              >
                <option value="">
                  All types
                </option>

                {inputTypes
                  .filter(
                    Boolean
                  )
                  .map(
                    (
                      type
                    ) => (
                      <option
                        key={
                          type
                        }
                        value={
                          type
                        }
                      >
                        {humanize(
                          type
                        )}
                      </option>
                    )
                  )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>


            <div className="relative">
              <select
                value={
                  status
                }
                aria-label="Filter by processing status"
                className={
                  selectClassName
                }
                onChange={(
                  event
                ) => {
                  setPage(
                    1
                  );

                  setStatus(
                    event.target
                      .value
                  );
                }}
              >
                <option value="">
                  All statuses
                </option>

                {statuses
                  .filter(
                    Boolean
                  )
                  .map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {humanize(
                          item
                        )}
                      </option>
                    )
                  )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>


            <Button
              type="submit"
              className="h-11"
            >
              <Search className="size-4" />

              Search
            </Button>


            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={
                resetFilters
              }
            >
              <RotateCcw className="size-4" />

              Reset
            </Button>
          </form>


          {/* ===============================================
              CONTENT
              =============================================== */}

          {documentsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({
                length: 6,
              }).map(
                (
                  _,
                  index
                ) => (
                  <Skeleton
                    key={
                      index
                    }
                    className="h-[76px] rounded-xl"
                  />
                )
              )}
            </div>
          ) : documentsQuery.isError ? (
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
                documentsQuery.error
              )}
            </div>
          ) : data?.items.length ? (
            <>
              <div
                className={[
                  "overflow-x-auto",
                  "rounded-2xl",
                  "border",
                  "border-border/70",
                  "bg-background/30",
                ].join(" ")}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/25 hover:bg-muted/25">
                      <TableHead className="min-w-[280px]">
                        Source
                      </TableHead>

                      <TableHead>
                        Type
                      </TableHead>

                      <TableHead>
                        Size
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead className="min-w-[130px]">
                        Added
                      </TableHead>

                      <TableHead className="text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>


                  <TableBody>
                    {data.items.map(
                      (
                        document
                      ) => {
                        const Icon =
                          getDocumentIcon(
                            document.input_type
                          );


                        return (
                          <TableRow
                            key={
                              document.id
                            }
                            className={[
                              "group",
                              "transition-colors",
                              "hover:bg-primary/[0.035]",
                            ].join(" ")}
                          >
                            <TableCell>
                              <Link
                                href={`/documents/${document.id}`}
                                className="flex min-w-0 items-center gap-3"
                              >
                                <div
                                  className={[
                                    "premium-icon-box",
                                    "flex",
                                    "size-10",
                                    "shrink-0",
                                    "items-center",
                                    "justify-center",
                                    "rounded-xl",
                                  ].join(" ")}
                                >
                                  <Icon className="size-[18px]" />
                                </div>


                                <div className="min-w-0">
                                  <p
                                    className={[
                                      "max-w-[380px]",
                                      "truncate",
                                      "text-sm",
                                      "font-semibold",
                                      "transition-colors",
                                      "group-hover:text-primary",
                                    ].join(" ")}
                                  >
                                    {
                                      document.original_filename
                                    }
                                  </p>

                                  <div
                                    className={[
                                      "mt-1",
                                      "flex",
                                      "items-center",
                                      "gap-2",
                                      "text-[10px]",
                                      "text-muted-foreground",
                                    ].join(" ")}
                                  >
                                    <span>
                                      {document.character_count.toLocaleString(
                                        "en-IN"
                                      )}{" "}
                                      chars
                                    </span>

                                    {document.page_count >
                                      0 && (
                                      <>
                                        <span>
                                          •
                                        </span>

                                        <span>
                                          {
                                            document.page_count
                                          }{" "}
                                          page
                                          {document.page_count ===
                                          1
                                            ? ""
                                            : "s"}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </TableCell>


                            <TableCell>
                              <Badge
                                variant="outline"
                                className="border-border/70 bg-muted/25 text-[10px]"
                              >
                                {humanize(
                                  document.input_type
                                )}
                              </Badge>
                            </TableCell>


                            <TableCell className="text-sm text-muted-foreground">
                              {formatBytes(
                                document.file_size
                              )}
                            </TableCell>


                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border text-[10px]",

                                  documentStatusClass(
                                    document.status
                                  )
                                )}
                              >
                                {humanize(
                                  document.status
                                )}
                              </Badge>
                            </TableCell>


                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(
                                document.created_at
                              )}
                            </TableCell>


                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Link
                                  href={`/documents/${document.id}`}
                                  className={cn(
                                    buttonVariants({
                                      variant:
                                        "ghost",

                                      size:
                                        "icon-sm",
                                    }),

                                    "hover:bg-primary/10 hover:text-primary"
                                  )}
                                  aria-label="View document"
                                >
                                  <Eye className="size-4" />
                                </Link>


                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={
                                    deleteMutation.isPending
                                  }
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() =>
                                    removeDocument(
                                      document.id,
                                      document.original_filename
                                    )
                                  }
                                  aria-label="Delete document"
                                >
                                  {deleteMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </div>


              {/* Pagination */}

              <div
                className={[
                  "flex",
                  "flex-col",
                  "justify-between",
                  "gap-4",

                  "rounded-xl",

                  "border",
                  "border-border/60",

                  "bg-muted/15",

                  "px-4",
                  "py-3",

                  "sm:flex-row",
                  "sm:items-center",
                ].join(" ")}
              >
                <div>
                  <p className="text-sm font-semibold">
                    {data.pagination.total.toLocaleString(
                      "en-IN"
                    )}{" "}
                    source
                    {data.pagination.total ===
                    1
                      ? ""
                      : "s"}
                  </p>

                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Page{" "}
                    {
                      data.pagination.page
                    }{" "}
                    of{" "}
                    {Math.max(
                      data.pagination.total_pages,
                      1
                    )}
                  </p>
                </div>


                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      page <=
                      1
                    }
                    onClick={() =>
                      setPage(
                        (
                          current
                        ) =>
                          Math.max(
                            1,
                            current -
                              1
                          )
                      )
                    }
                  >
                    <ArrowLeft className="size-3.5" />

                    Previous
                  </Button>


                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      page >=
                      data.pagination.total_pages
                    }
                    onClick={() =>
                      setPage(
                        (
                          current
                        ) =>
                          current +
                          1
                      )
                    }
                  >
                    Next

                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div
              className={[
                "rounded-2xl",

                "border",
                "border-dashed",
                "border-border",

                "bg-muted/15",

                "px-5",
                "py-16",

                "text-center",
              ].join(" ")}
            >
              <div className="premium-icon-box mx-auto flex size-14 items-center justify-center rounded-2xl">
                <FileArchive className="size-6" />
              </div>

              <h3 className="mt-5 text-base font-semibold">
                No sources found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Add a source to Transform Studio, or reset the
                current filters to view other content.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    resetFilters
                  }
                >
                  <RotateCcw className="size-4" />

                  Reset Filters
                </Button>

                <Link
                  href="/transform"
                  className={buttonVariants({
                    variant:
                      "default",
                  })}
                >
                  <UploadCloud className="size-4" />

                  Add Source
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Security note */}

      <div
        className={[
          "flex",
          "items-start",
          "gap-3",

          "rounded-xl",

          "border",
          "border-primary/15",

          "bg-primary/5",

          "px-4",
          "py-3.5",
        ].join(" ")}
      >
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />

        <p className="text-xs leading-5 text-muted-foreground">
          Source documents are isolated per authenticated user and
          stored using private workspace access controls.
        </p>

        <Sparkles className="ml-auto hidden size-4 shrink-0 text-primary/60 sm:block" />
      </div>
    </div>
  );
}