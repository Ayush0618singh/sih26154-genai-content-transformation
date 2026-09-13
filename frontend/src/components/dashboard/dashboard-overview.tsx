"use client";

import {
  Activity,
  CheckCircle2,
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
  formatBytes,
  formatDate,
  formatNumber,
  formatShortDate,
  humanize,
} from "@/lib/utils/format";


function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-36"
            />
          )
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
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
      <Alert
        variant="destructive"
      >
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5"
            >
              <Sparkles className="size-3" />
              AI Workspace
            </Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Monitor documents, AI transformations, outputs and exports.
          </p>
        </div>

        <div className="rounded-xl border bg-card px-4 py-3 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground">
            Processing success rate
          </p>

          <div className="mt-1 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />

            <span className="font-bold">
              {
                overview.success_rate
              }
              %
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Documents"
          value={formatNumber(
            overview.total_documents
          )}
          description="Source files and direct-text inputs"
          icon={Files}
        />

        <StatCard
          title="Transformations"
          value={formatNumber(
            overview.total_transformations
          )}
          description="AI transformation jobs created"
          icon={WandSparkles}
        />

        <StatCard
          title="Generated outputs"
          value={formatNumber(
            overview.total_generated_outputs
          )}
          description="Summaries, posts, presentations and more"
          icon={Sparkles}
        />

        <StatCard
          title="Exports"
          value={formatNumber(
            overview.total_exports
          )}
          description="PDF, DOCX, PPTX, JSON, CSV and SRT"
          icon={Download}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Usage timeline
            </CardTitle>

            <CardDescription>
              Documents, transformations and exports during the last 14 days.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analyticsQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
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
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={
                        false
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
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="documents"
                      stroke="var(--chart-1)"
                      strokeWidth={
                        2
                      }
                      dot={
                        false
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="transformations"
                      stroke="var(--chart-2)"
                      strokeWidth={
                        2
                      }
                      dot={
                        false
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="exports"
                      stroke="var(--chart-3)"
                      strokeWidth={
                        2
                      }
                      dot={
                        false
                      }
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                Usage data will appear after your first transformation.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Workspace health
            </CardTitle>

            <CardDescription>
              Current processing and storage status.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>
                  Success rate
                </span>

                <span className="font-semibold">
                  {
                    overview.success_rate
                  }
                  %
                </span>
              </div>

              <Progress
                value={
                  overview.success_rate
                }
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-primary" />

                  <span className="text-sm">
                    Completed
                  </span>
                </div>

                <span className="font-semibold">
                  {formatNumber(
                    overview.completed_transformations
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <Activity className="size-4 text-muted-foreground" />

                  <span className="text-sm">
                    Failed
                  </span>
                </div>

                <span className="font-semibold">
                  {formatNumber(
                    overview.failed_transformations
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <HardDrive className="size-4 text-muted-foreground" />

                  <span className="text-sm">
                    Storage
                  </span>
                </div>

                <span className="font-semibold">
                  {formatBytes(
                    overview.total_storage_bytes
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Input distribution
            </CardTitle>

            <CardDescription>
              Source formats currently processed by the platform.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {analytics?.input_type_distribution?.length ? (
              <div className="h-64">
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
                      right: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={
                        false
                      }
                    />

                    <XAxis
                      dataKey="label"
                      tickFormatter={
                        humanize
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
                    />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      fill="var(--chart-1)"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No document statistics yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Recent documents
            </CardTitle>

            <CardDescription>
              Latest source content added to your workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {overview.recent_documents.length ? (
              <div className="divide-y">
                {overview.recent_documents.map(
                  (
                    document
                  ) => (
                    <div
                      key={
                        document.id
                      }
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {
                            document.original_filename
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {humanize(
                            document.input_type
                          )}
                          {" · "}
                          {formatDate(
                            document.created_at
                          )}
                        </p>
                      </div>

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
                  )
                )}
              </div>
            ) : (
              <div className="flex min-h-48 items-center justify-center text-center">
                <div>
                  <FileText className="mx-auto size-8 text-muted-foreground/50" />

                  <p className="mt-3 text-sm font-medium">
                    No documents yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your uploaded sources will appear here.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Recent activity
          </CardTitle>

          <CardDescription>
            Latest actions across your AI transformation workspace.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {overview.recent_activity.length ? (
            <div className="grid gap-2">
              {overview.recent_activity.map(
                (
                  activity
                ) => (
                  <div
                    key={
                      activity.id
                    }
                    className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {humanize(
                          activity.event_type
                        )}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(
                          activity.created_at
                        )}
                      </p>
                    </div>

                    <Activity className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Activity will appear here as you use the platform.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}