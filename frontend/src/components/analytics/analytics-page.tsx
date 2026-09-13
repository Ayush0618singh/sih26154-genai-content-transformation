"use client";

import {
  useState,
} from "react";

import {
  Activity,
  BarChart3,
  Files,
  Sparkles,
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
  Skeleton,
} from "@/components/ui/skeleton";

import {
  getDashboardAnalytics,
  getDashboardOverview,
} from "@/lib/api/dashboard";

import {
  getApiErrorMessage,
} from "@/lib/api/client";

import {
  formatNumber,
  formatShortDate,
  humanize,
} from "@/lib/utils/format";


const selectClassName =
  "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40";


export function AnalyticsPage() {
  const [
    days,
    setDays,
  ] = useState(
    30
  );


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
        days,
      ],

      queryFn: () =>
        getDashboardAnalytics(
          days
        ),
    });


  if (
    analyticsQuery.isLoading ||
    overviewQuery.isLoading
  ) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-64" />

        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <Skeleton className="h-96" />
      </div>
    );
  }


  if (
    analyticsQuery.isError ||
    overviewQuery.isError ||
    !analyticsQuery.data ||
    !overviewQuery.data
  ) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
        {getApiErrorMessage(
          analyticsQuery.error ??
            overviewQuery.error
        )}
      </div>
    );
  }


  const analytics =
    analyticsQuery.data;

  const overview =
    overviewQuery.data;


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary">
            Usage Intelligence
          </Badge>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Understand source usage, generated outputs and processing activity.
          </p>
        </div>

        <select
          value={
            days
          }
          className={
            selectClassName
          }
          onChange={(
            event
          ) =>
            setDays(
              Number(
                event.target
                  .value
              )
            )
          }
        >
          <option value={7}>
            Last 7 days
          </option>

          <option value={14}>
            Last 14 days
          </option>

          <option value={30}>
            Last 30 days
          </option>

          <option value={60}>
            Last 60 days
          </option>

          <option value={90}>
            Last 90 days
          </option>
        </select>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <Files className="size-5 text-primary" />

            <p className="mt-4 text-sm text-muted-foreground">
              Documents
            </p>

            <p className="mt-1 text-3xl font-bold">
              {formatNumber(
                overview.total_documents
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Sparkles className="size-5 text-primary" />

            <p className="mt-4 text-sm text-muted-foreground">
              AI Outputs
            </p>

            <p className="mt-1 text-3xl font-bold">
              {formatNumber(
                overview.total_generated_outputs
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <BarChart3 className="size-5 text-primary" />

            <p className="mt-4 text-sm text-muted-foreground">
              Exports
            </p>

            <p className="mt-1 text-3xl font-bold">
              {formatNumber(
                overview.total_exports
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Activity className="size-5 text-primary" />

            <p className="mt-4 text-sm text-muted-foreground">
              Success Rate
            </p>

            <p className="mt-1 text-3xl font-bold">
              {
                overview.success_rate
              }
              %
            </p>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>
            Activity Timeline
          </CardTitle>

          <CardDescription>
            Documents, transformations and exports over time.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-80">
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
                  fontSize={11}
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
                  fontSize={11}
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
                  strokeWidth={2}
                  dot={
                    false
                  }
                />

                <Line
                  type="monotone"
                  dataKey="transformations"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={
                    false
                  }
                />

                <Line
                  type="monotone"
                  dataKey="exports"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={
                    false
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>


      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Input Type Distribution
            </CardTitle>

            <CardDescription>
              Source formats used by your workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-72">
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
                    fontSize={11}
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
                    fontSize={11}
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
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>
              Output Type Distribution
            </CardTitle>

            <CardDescription>
              Which AI communication outputs are generated most often.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    analytics.output_type_distribution
                  }
                  layout="vertical"
                  margin={{
                    left: 15,
                    right: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={
                      false
                    }
                  />

                  <XAxis
                    type="number"
                    allowDecimals={
                      false
                    }
                    fontSize={11}
                    tickLine={
                      false
                    }
                    axisLine={
                      false
                    }
                  />

                  <YAxis
                    type="category"
                    dataKey="label"
                    tickFormatter={
                      humanize
                    }
                    width={120}
                    fontSize={10}
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
                    fill="var(--chart-2)"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>
            Transformation Status
          </CardTitle>

          <CardDescription>
            Current processing outcomes across your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analytics.transformation_status_distribution.map(
              (
                item
              ) => (
                <div
                  key={
                    item.label
                  }
                  className="rounded-xl border p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {humanize(
                      item.label
                    )}
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {
                      item.count
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}