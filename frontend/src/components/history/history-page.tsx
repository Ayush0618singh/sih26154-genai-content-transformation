"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  Eye,
  History,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  deleteTransformation,
  getTransformations,
} from "@/lib/api/transformations";

import {
  getApiErrorMessage,
} from "@/lib/api/client";

import {
  cn,
} from "@/lib/utils";

import {
  formatDate,
  humanize,
} from "@/lib/utils/format";


const selectClassName =
  "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40";


export function HistoryPage() {
  const queryClient =
    useQueryClient();

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    status,
    setStatus,
  ] = useState("");


  const query =
    useQuery({
      queryKey: [
        "transformations",
        page,
        status,
      ],

      queryFn: () =>
        getTransformations({
          page,

          pageSize:
            20,

          status:
            status ||
            undefined,
        }),
    });


  const deleteMutation =
    useMutation({
      mutationFn:
        deleteTransformation,

      onSuccess:
        async () => {
          toast.success(
            "Transformation deleted."
          );

          await queryClient.invalidateQueries(
            {
              queryKey: [
                "transformations",
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


  function remove(
    id: string,
    title:
      string | null
  ) {
    const confirmed =
      window.confirm(
        `Delete "${title ?? "this transformation"}" and its exports?`
      );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(
      id
    );
  }


  const data =
    query.data;


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Badge variant="secondary">
          Transformation History
        </Badge>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          History
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Review previous AI transformations and reopen generated results.
        </p>
      </div>


      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>
                Transformations
              </CardTitle>

              <CardDescription className="mt-1">
                Complete history of AI processing jobs.
              </CardDescription>
            </div>

            <select
              className={
                selectClassName
              }
              value={
                status
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

              <option value="completed">
                Completed
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="pending">
                Pending
              </option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {query.isLoading ? (
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
                    className="h-16"
                  />
                )
              )}
            </div>
          ) : query.isError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
              {getApiErrorMessage(
                query.error
              )}
            </div>
          ) : data?.items.length ? (
            <>
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        Transformation
                      </TableHead>

                      <TableHead>
                        Audience
                      </TableHead>

                      <TableHead>
                        Outputs
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Created
                      </TableHead>

                      <TableHead className="text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.items.map(
                      (
                        item
                      ) => (
                        <TableRow
                          key={
                            item.id
                          }
                        >
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="truncate font-medium">
                                {item.title ??
                                  "Transformation"}
                              </p>

                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {item.objective ??
                                  "No objective"}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            {item.target_audience ??
                              "General"}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {
                                  item.output_count
                                }
                              </Badge>

                              <span className="hidden text-xs text-muted-foreground xl:inline">
                                {item.selected_outputs
                                  .slice(
                                    0,
                                    2
                                  )
                                  .map(
                                    humanize
                                  )
                                  .join(
                                    ", "
                                  )}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                item.status ===
                                "completed"
                                  ? "secondary"
                                  : item.status ===
                                      "failed"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {
                                item.status
                              }
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              item.created_at
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {item.status ===
                                "completed" && (
                                <Link
                                  href={`/results/${item.id}`}
                                  className={cn(
                                    buttonVariants({
                                      variant:
                                        "ghost",
                                      size:
                                        "icon",
                                    })
                                  )}
                                  aria-label="View transformation"
                                >
                                  <Eye className="size-4" />
                                </Link>
                              )}

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={
                                  deleteMutation.isPending
                                }
                                onClick={() =>
                                  remove(
                                    item.id,
                                    item.title
                                  )
                                }
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


              <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                  {data.pagination.total.toLocaleString(
                    "en-IN"
                  )}{" "}
                  transformation
                  {data.pagination.total !==
                  1
                    ? "s"
                    : ""}
                </p>

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
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <History className="mx-auto size-10 text-muted-foreground/40" />

              <p className="mt-4 font-semibold">
                No transformations yet
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Your completed AI jobs will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}