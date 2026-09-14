"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Clock3,
  Eye,
  History,
  Loader2,
  Sparkles,
  Trash2,
  WandSparkles,
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


const selectClassName = [
  "h-11",
  "min-w-[170px]",
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
  "hover:border-primary/30",
  "focus:border-primary/50",
  "focus:ring-4",
  "focus:ring-primary/10",
].join(" ");


function transformationStatusClass(
  status: string
) {
  switch (
    status.toLowerCase()
  ) {
    case "completed":
      return "border-primary/25 bg-primary/10 text-primary";

    case "processing":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300";

    case "failed":
      return "border-destructive/25 bg-destructive/10 text-destructive";

    case "pending":
      return "border-border bg-muted/50 text-muted-foreground";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}


export function HistoryPage() {
  const queryClient =
    useQueryClient();


  const [
    page,
    setPage,
  ] = useState(
    1
  );


  const [
    status,
    setStatus,
  ] = useState(
    ""
  );


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
        ) => {
          toast.error(
            getApiErrorMessage(
              error
            )
          );
        },
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


    if (
      !confirmed
    ) {
      return;
    }


    deleteMutation.mutate(
      id
    );
  }


  const data =
    query.data;


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
              <Clock3 className="size-3.5" />

              Transformation Timeline
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
              History
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review previous AI transformation jobs, inspect their
              status and reopen completed generated results.
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
            <WandSparkles className="size-4" />

            New Transformation

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>


      {/* =====================================================
          HISTORY
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
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  AI Transformations
                </CardTitle>

                {data && (
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    {data.pagination.total.toLocaleString(
                      "en-IN"
                    )}{" "}
                    RUNS
                  </Badge>
                )}
              </div>

              <CardDescription className="mt-1">
                Complete history of content intelligence and generation jobs.
              </CardDescription>
            </div>


            <div className="relative">
              <select
                className={
                  selectClassName
                }
                value={
                  status
                }
                aria-label="Filter transformation status"
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

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>


        <CardContent className="pt-6">
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
                    className="h-[78px] rounded-xl"
                  />
                )
              )}
            </div>
          ) : query.isError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
              {getApiErrorMessage(
                query.error
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
                      <TableHead className="min-w-[300px]">
                        Transformation
                      </TableHead>

                      <TableHead>
                        Audience
                      </TableHead>

                      <TableHead className="min-w-[180px]">
                        Outputs
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead className="min-w-[130px]">
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
                          className="group transition-colors hover:bg-primary/[0.035]"
                        >
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-3">
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
                                <Sparkles className="size-[18px]" />
                              </div>


                              <div className="min-w-0">
                                <p
                                  className={[
                                    "max-w-[360px]",
                                    "truncate",
                                    "text-sm",
                                    "font-semibold",
                                  ].join(" ")}
                                >
                                  {item.title ??
                                    "AI Transformation"}
                                </p>

                                <p
                                  className={[
                                    "mt-1",
                                    "max-w-[360px]",
                                    "truncate",
                                    "text-[10px]",
                                    "text-muted-foreground",
                                  ].join(" ")}
                                >
                                  {item.objective ??
                                    "No communication objective"}
                                </p>
                              </div>
                            </div>
                          </TableCell>


                          <TableCell>
                            <span className="text-sm font-medium">
                              {item.target_audience ??
                                "General"}
                            </span>
                          </TableCell>


                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className={[
                                  "flex",
                                  "size-7",
                                  "items-center",
                                  "justify-center",

                                  "rounded-lg",

                                  "border",
                                  "border-primary/20",

                                  "bg-primary/8",

                                  "text-[10px]",
                                  "font-bold",
                                  "text-primary",
                                ].join(" ")}
                              >
                                {
                                  item.output_count
                                }
                              </span>


                              <span className="max-w-[180px] truncate text-xs text-muted-foreground">
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

                                {item.selected_outputs.length >
                                2
                                  ? ` +${item.selected_outputs.length - 2}`
                                  : ""}
                              </span>
                            </div>
                          </TableCell>


                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border text-[10px]",

                                transformationStatusClass(
                                  item.status
                                )
                              )}
                            >
                              {humanize(
                                item.status
                              )}
                            </Badge>
                          </TableCell>


                          <TableCell className="text-sm text-muted-foreground">
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
                                        "icon-sm",
                                    }),

                                    "hover:bg-primary/10 hover:text-primary"
                                  )}
                                  aria-label="View transformation"
                                >
                                  <Eye className="size-4" />
                                </Link>
                              )}


                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={
                                  deleteMutation.isPending
                                }
                                className="hover:bg-destructive/10 hover:text-destructive"
                                onClick={() =>
                                  remove(
                                    item.id,
                                    item.title
                                  )
                                }
                                aria-label="Delete transformation"
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
                      )
                    )}
                  </TableBody>
                </Table>
              </div>


              {/* Pagination */}

              <div
                className={[
                  "mt-5",

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
                    transformation
                    {data.pagination.total !==
                    1
                      ? "s"
                      : ""}
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
                <History className="size-6" />
              </div>

              <h3 className="mt-5 text-base font-semibold">
                No transformations found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Completed and in-progress AI transformation jobs will
                appear here.
              </p>

              <Link
                href="/transform"
                className={cn(
                  buttonVariants({
                    variant:
                      "default",
                  }),

                  "mt-6"
                )}
              >
                <WandSparkles className="size-4" />

                Start Transformation
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}