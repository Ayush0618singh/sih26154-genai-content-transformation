"use client";

import Link from "next/link";

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Files,
  HardDrive,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

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
  Progress,
} from "@/components/ui/progress";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  StatCard,
} from "@/components/dashboard/stat-card";

import {
  getDashboardAnalytics,
  getDashboardOverview,
} from "@/lib/api/dashboard";

import {
  getApiErrorMessage,
} from "@/lib/api/client";

import {
  cn,
} from "@/lib/utils";

import {
  formatBytes,
  formatDate,
  formatNumber,
  formatShortDate,
  humanize,
} from "@/lib/utils/format";


const tooltipStyle = {
  backgroundColor:
    "var(--card)",

  border:
    "1px solid var(--border)",

  borderRadius:
    "12px",

  boxShadow:
    "0 18px 50px -28px rgba(0,0,0,0.45)",

  fontSize:
    "12px",
};


function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-36 rounded-full" />

        <Skeleton className="h-10 w-72 max-w-full" />

        <Skeleton className="h-4 w-[440px] max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map(
          (_, index) => (
            <Skeleton
              key={
                index
              }
              className="h-44 rounded-2xl"
            />
          )
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[390px] rounded-2xl xl:col-span-2" />

        <Skeleton className="h-[390px] rounded-2xl" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />

        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}


function statusClass(
  status: string
) {
  const normalized =
    status.toLowerCase();

  if (
    normalized ===
    "completed"
  ) {
    return [
      "border-primary/20",
      "bg-primary/10",
      "text-primary",
    ].join(" ");
  }

  if (
    normalized ===
    "failed"
  ) {
    return [
      "border-destructive/20",
      "bg-destructive/10",
      "text-destructive",
    ].join(" ");
  }

  if (
    normalized ===
    "processing"
  ) {
    return [
      "border-amber-500/20",
      "bg-amber-500/10",
      "text-amber-700",
      "dark:text-amber-300",
    ].join(" ");
  }

  return [
    "border-border",
    "bg-muted",
    "text-muted-foreground",
  ].join(" ");
}


export function DashboardOverview() {
  const overviewQuery =
    useQuery({
      queryKey: [
        "dashboard",
        "overview",
      ],

      queryFn:
        getDashboardOverview,
    });


  const analyticsQuery =
    useQuery({
      queryKey: [
        "dashboard",
        "analytics",
        14,
      ],

      queryFn: () =>
        getDashboardAnalytics(
          14
        ),
    });


  if (
    overviewQuery.isLoading
  ) {
    return (
      <DashboardSkeleton />
    );
  }


  if (
    overviewQuery.isError ||
    !overviewQuery.data
  ) {
    return (
      <Alert variant="destructive">
        <Activity className="size-4" />

        <AlertTitle>
          Dashboard unavailable
        </AlertTitle>

        <AlertDescription>
          {getApiErrorMessage(
            overviewQuery.error
          )}
        </AlertDescription>
      </Alert>
    );
  }


  const overview =
    overviewQuery.data;

  const analytics =
    analyticsQuery.data;

  const successRate =
    Math.max(
      0,
      Math.min(
        100,
        overview.success_rate
      )
    );


  return (
    <div className="space-y-6 lg:space-y-7">
      {/* =====================================================
          PAGE HEADER
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
          "via-card/85",
          "to-card",

          "p-6",

          "shadow-[0_26px_80px_-55px_rgba(0,0,0,0.6)]",

          "sm:p-7",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none",
            "absolute",
            "-right-24",
            "-top-32",

            "size-80",

            "rounded-full",

            "bg-primary/12",
            "blur-[80px]",
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
          <div>
            <div className="premium-kicker">
              <Sparkles className="size-3.5" />

              Intelligence Workspace
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
              Dashboard
            </h1>

            <p
              className={[
                "mt-3",
                "max-w-2xl",

                "text-sm",
                "leading-6",
                "text-muted-foreground",
              ].join(" ")}
            >
              Monitor your source library, AI transformations,
              generated assets and export activity from one secure
              workspace.
            </p>
          </div>


          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/documents"
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
              <Files className="size-4" />

              Source Library
            </Link>

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
        </div>
      </section>


      {/* =====================================================
          KPI CARDS
          ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Documents"
          value={formatNumber(
            overview.total_documents
          )}
          description="Source files and direct-text inputs in your workspace."
          icon={Files}
        />

        <StatCard
          title="Transformations"
          value={formatNumber(
            overview.total_transformations
          )}
          description="AI transformation workflows created."
          icon={WandSparkles}
        />

        <StatCard
          title="Generated Outputs"
          value={formatNumber(
            overview.total_generated_outputs
          )}
          description="Audience-ready content assets generated."
          icon={Sparkles}
        />

        <StatCard
          title="Exports"
          value={formatNumber(
            overview.total_exports
          )}
          description="PDF, DOCX, PPTX, JSON, CSV and SRT exports."
          icon={Download}
        />
      </section>


      {/* =====================================================
          TIMELINE + HEALTH
          ===================================================== */}

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="premium-card xl:col-span-2">
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
                <CardTitle>
                  Usage Timeline
                </CardTitle>

                <CardDescription>
                  Documents, transformations and exports during the
                  last 14 days.
                </CardDescription>
              </div>

              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary"
              >
                14 DAY VIEW
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {analyticsQuery.isLoading ? (
              <Skeleton className="h-72 w-full rounded-xl" />
            ) : analytics?.timeline?.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={
                      analytics.timeline
                    }
                    margin={{
                      top: 10,
                      right: 8,
                      left: -22,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="4 4"
                      vertical={
                        false
                      }
                      opacity={
                        0.55
                      }
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={
                        formatShortDate
                      }
                      fontSize={
                        11
                      }
                      tickLine={
                        false
                      }
                      axisLine={
                        false
                      }
                      tick={{
                        fill:
                          "var(--muted-foreground)",
                      }}
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                      fontSize={
                        11
                      }
                      tickLine={
                        false
                      }
                      axisLine={
                        false
                      }
                      tick={{
                        fill:
                          "var(--muted-foreground)",
                      }}
                    />

                    <Tooltip
                      contentStyle={
                        tooltipStyle
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="documents"
                      name="Documents"
                      stroke="var(--chart-1)"
                      strokeWidth={
                        2.6
                      }
                      dot={
                        false
                      }
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="transformations"
                      name="Transformations"
                      stroke="var(--chart-2)"
                      strokeWidth={
                        2.6
                      }
                      dot={
                        false
                      }
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="exports"
                      name="Exports"
                      stroke="var(--chart-3)"
                      strokeWidth={
                        2.6
                      }
                      dot={
                        false
                      }
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                className={[
                  "flex",
                  "h-72",
                  "flex-col",
                  "items-center",
                  "justify-center",

                  "rounded-xl",

                  "border",
                  "border-dashed",
                  "border-border",

                  "bg-muted/20",

                  "text-center",
                ].join(" ")}
              >
                <Activity className="size-7 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  No timeline data yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Activity will appear after transformations are created.
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        <Card className="premium-card">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardTitle>
              Workspace Health
            </CardTitle>

            <CardDescription>
              Processing reliability and workspace storage.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Processing success rate
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-[-0.04em]">
                    {overview.success_rate}
                    %
                  </p>
                </div>

                <div
                  className={[
                    "premium-icon-box",
                    "size-10",
                    "rounded-xl",
                  ].join(" ")}
                >
                  <CheckCircle2 className="size-5" />
                </div>
              </div>

              <Progress
                value={
                  successRate
                }
                className="h-2"
              />
            </div>


            <div className="grid gap-3">
              <div
                className={[
                  "flex",
                  "items-center",
                  "justify-between",

                  "rounded-xl",

                  "border",
                  "border-border/70",

                  "bg-background/55",

                  "p-3.5",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-primary" />

                  <span className="text-sm font-medium">
                    Completed
                  </span>
                </div>

                <span className="text-sm font-bold">
                  {formatNumber(
                    overview.completed_transformations
                  )}
                </span>
              </div>


              <div
                className={[
                  "flex",
                  "items-center",
                  "justify-between",

                  "rounded-xl",

                  "border",
                  "border-border/70",

                  "bg-background/55",

                  "p-3.5",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <Activity className="size-4 text-destructive" />

                  <span className="text-sm font-medium">
                    Failed
                  </span>
                </div>

                <span className="text-sm font-bold">
                  {formatNumber(
                    overview.failed_transformations
                  )}
                </span>
              </div>


              <div
                className={[
                  "flex",
                  "items-center",
                  "justify-between",

                  "rounded-xl",

                  "border",
                  "border-border/70",

                  "bg-background/55",

                  "p-3.5",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="size-4 text-primary" />

                  <span className="text-sm font-medium">
                    Storage
                  </span>
                </div>

                <span className="text-sm font-bold">
                  {formatBytes(
                    overview.total_storage_bytes
                  )}
                </span>
              </div>
            </div>


            <div
              className={[
                "rounded-xl",

                "border",
                "border-primary/15",

                "bg-primary/5",

                "p-4",
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
                System Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />

                <span className="text-sm font-semibold">
                  Intelligence services operational
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>


      {/* =====================================================
          RECENT DOCUMENTS + TRANSFORMATIONS
          ===================================================== */}

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="premium-card">
          <CardHeader className="border-b border-border/60 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>
                  Recent Documents
                </CardTitle>

                <CardDescription>
                  Latest sources added to the workspace.
                </CardDescription>
              </div>

              <Link
                href="/documents"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-3">
            {overview.recent_documents.length ? (
              <div className="divide-y divide-border/60">
                {overview.recent_documents
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      document
                    ) => (
                      <Link
                        key={
                          document.id
                        }
                        href={`/documents/${document.id}`}
                        className={[
                          "group",
                          "flex",
                          "items-center",
                          "gap-3",

                          "py-3.5",

                          "transition-colors",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "premium-icon-box",
                            "size-9",
                            "shrink-0",
                            "rounded-lg",
                          ].join(" ")}
                        >
                          <FileText className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={[
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
                              "flex-wrap",
                              "items-center",
                              "gap-x-2",
                              "gap-y-1",

                              "text-[10px]",
                              "text-muted-foreground",
                            ].join(" ")}
                          >
                            <span>
                              {humanize(
                                document.input_type
                              )}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {formatBytes(
                                document.file_size
                              )}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {formatDate(
                                document.created_at
                              )}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "hidden border sm:inline-flex",

                            statusClass(
                              document.status
                            )
                          )}
                        >
                          {humanize(
                            document.status
                          )}
                        </Badge>

                        <ArrowRight
                          className={[
                            "size-4",
                            "shrink-0",
                            "text-muted-foreground",

                            "transition-all",

                            "group-hover:translate-x-0.5",
                            "group-hover:text-primary",
                          ].join(" ")}
                        />
                      </Link>
                    )
                  )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Files className="mx-auto size-7 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  No documents yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Add your first source in Transform Studio.
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        <Card className="premium-card">
          <CardHeader className="border-b border-border/60 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>
                  Recent Transformations
                </CardTitle>

                <CardDescription>
                  Latest AI content generation workflows.
                </CardDescription>
              </div>

              <Link
                href="/history"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View history
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-3">
            {overview.recent_transformations.length ? (
              <div className="divide-y divide-border/60">
                {overview.recent_transformations
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      transformation
                    ) => (
                      <Link
                        key={
                          transformation.id
                        }
                        href={`/results/${transformation.id}`}
                        className={[
                          "group",
                          "flex",
                          "items-center",
                          "gap-3",

                          "py-3.5",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "premium-icon-box",
                            "size-9",
                            "shrink-0",
                            "rounded-lg",
                          ].join(" ")}
                        >
                          <WandSparkles className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={[
                              "truncate",
                              "text-sm",
                              "font-semibold",

                              "transition-colors",

                              "group-hover:text-primary",
                            ].join(" ")}
                          >
                            {transformation.title ??
                              "AI Transformation"}
                          </p>

                          <div
                            className={[
                              "mt-1",
                              "flex",
                              "flex-wrap",
                              "items-center",
                              "gap-x-2",

                              "text-[10px]",
                              "text-muted-foreground",
                            ].join(" ")}
                          >
                            <span>
                              {formatNumber(
                                transformation.output_count
                              )}{" "}
                              outputs
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {formatDate(
                                transformation.created_at
                              )}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "hidden border sm:inline-flex",

                            statusClass(
                              transformation.status
                            )
                          )}
                        >
                          {humanize(
                            transformation.status
                          )}
                        </Badge>

                        <ArrowRight
                          className={[
                            "size-4",
                            "shrink-0",
                            "text-muted-foreground",

                            "transition-all",

                            "group-hover:translate-x-0.5",
                            "group-hover:text-primary",
                          ].join(" ")}
                        />
                      </Link>
                    )
                  )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <WandSparkles className="mx-auto size-7 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  No transformations yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your latest AI generations will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>


      {/* =====================================================
          INPUT DISTRIBUTION + ACTIVITY
          ===================================================== */}

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="premium-card">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardTitle>
              Source Distribution
            </CardTitle>

            <CardDescription>
              Input formats currently used in your workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {analytics?.input_type_distribution?.length ? (
              <div className="h-[270px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      analytics.input_type_distribution
                    }
                    margin={{
                      left: -20,
                      right: 4,
                      top: 4,
                    }}
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="4 4"
                      vertical={
                        false
                      }
                      opacity={
                        0.55
                      }
                    />

                    <XAxis
                      dataKey="label"
                      tickFormatter={
                        humanize
                      }
                      tickLine={
                        false
                      }
                      axisLine={
                        false
                      }
                      fontSize={
                        10
                      }
                      tick={{
                        fill:
                          "var(--muted-foreground)",
                      }}
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                      tickLine={
                        false
                      }
                      axisLine={
                        false
                      }
                      fontSize={
                        10
                      }
                      tick={{
                        fill:
                          "var(--muted-foreground)",
                      }}
                    />

                    <Tooltip
                      contentStyle={
                        tooltipStyle
                      }
                    />

                    <Bar
                      dataKey="count"
                      name="Sources"
                      fill="var(--chart-1)"
                      radius={[
                        7,
                        7,
                        2,
                        2,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[270px] items-center justify-center text-sm text-muted-foreground">
                No source distribution data yet.
              </div>
            )}
          </CardContent>
        </Card>


        <Card className="premium-card">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardTitle>
              Recent Activity
            </CardTitle>

            <CardDescription>
              Latest workspace events and processing activity.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-3">
            {overview.recent_activity.length ? (
              <div className="divide-y divide-border/60">
                {overview.recent_activity
                  .slice(
                    0,
                    6
                  )
                  .map(
                    (
                      event
                    ) => (
                      <div
                        key={
                          event.id
                        }
                        className="flex items-center gap-3 py-3.5"
                      >
                        <div
                          className={[
                            "flex",
                            "size-9",
                            "shrink-0",
                            "items-center",
                            "justify-center",

                            "rounded-lg",

                            "border",
                            "border-primary/15",

                            "bg-primary/7",
                            "text-primary",
                          ].join(" ")}
                        >
                          <Clock3 className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {humanize(
                              event.event_type
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {formatDate(
                              event.created_at
                            )}
                          </p>
                        </div>

                        <span className="size-2 rounded-full bg-primary/70" />
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div className="flex min-h-[270px] flex-col items-center justify-center text-center">
                <Activity className="size-7 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  No recent activity
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Workspace events will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}