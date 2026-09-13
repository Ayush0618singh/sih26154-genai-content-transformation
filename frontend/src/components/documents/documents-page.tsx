"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  Eye,
  FileText,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
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


const selectClassName =
  "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40";


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
        ) =>
          toast.error(
            getApiErrorMessage(
              error
            )
          ),
    });


  function submitSearch(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPage(1);

    setSearch(
      searchInput.trim()
    );
  }


  function resetFilters() {
    setPage(1);

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

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(
      documentId
    );
  }


  const data =
    documentsQuery.data;


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary">
            Source Library
          </Badge>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Documents
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage uploaded and direct-text source content.
          </p>
        </div>

        <Link
          href="/transform"
          className={cn(
            buttonVariants({
              variant:
                "default",
            })
          )}
        >
          <UploadCloud className="mr-2 size-4" />

          Add Source
        </Link>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>
            Source Library
          </CardTitle>

          <CardDescription>
            Search and filter documents already processed by the platform.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form
            onSubmit={
              submitSearch
            }
            className="flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search filename..."
                className="pl-10"
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

            <select
              value={
                inputType
              }
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

            <select
              value={
                status
              }
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

            <Button
              type="submit"
            >
              Search
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={
                resetFilters
              }
            >
              Reset
            </Button>
          </form>


          {documentsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({
                length: 5,
              }).map(
                (
                  _,
                  index
                ) => (
                  <Skeleton
                    key={
                      index
                    }
                    className="h-16"
                  />
                )
              )}
            </div>
          ) : documentsQuery.isError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
              {getApiErrorMessage(
                documentsQuery.error
              )}
            </div>
          ) : data?.items.length ? (
            <>
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        Document
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

                      <TableHead>
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
                      ) => (
                        <TableRow
                          key={
                            document.id
                          }
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <FileText className="size-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-xs truncate font-medium">
                                  {
                                    document.original_filename
                                  }
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {document.character_count.toLocaleString(
                                    "en-IN"
                                  )}{" "}
                                  chars
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {humanize(
                              document.input_type
                            )}
                          </TableCell>

                          <TableCell>
                            {formatBytes(
                              document.file_size
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                document.status ===
                                "ready"
                                  ? "secondary"
                                  : document.status ===
                                      "failed"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {
                                document.status
                              }
                            </Badge>
                          </TableCell>

                          <TableCell>
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
                                      "icon",
                                  })
                                )}
                                aria-label="Open document"
                              >
                                <Eye className="size-4" />
                              </Link>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={
                                  deleteMutation.isPending
                                }
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
                                  <Trash2 className="size-4 text-destructive" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>


              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                  {data.pagination.total.toLocaleString(
                    "en-IN"
                  )}{" "}
                  document
                  {data.pagination.total !==
                  1
                    ? "s"
                    : ""}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
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
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page{" "}
                    {
                      data.pagination.page
                    }{" "}
                    of{" "}
                    {Math.max(
                      data.pagination.total_pages,
                      1
                    )}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
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
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed py-16 text-center">
              <FileText className="mx-auto size-10 text-muted-foreground/40" />

              <p className="mt-4 font-semibold">
                No documents found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Upload a source or adjust the current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}