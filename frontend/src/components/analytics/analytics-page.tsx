"use client";

import {
  useState,
} from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  Files,
  Sparkles,
  TrendingUp,
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
  Progress,
} from "@/components/ui/progress";

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


function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-36 rounded-full" />

        <Skeleton className="h-10 w-64" />

        <Skeleton className="h-4 w-[430px] max-w-full" />
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
              className="h-36 rounded-2xl"
            />
          )
        )}
      </div>

      <Skeleton className="h-96 rounded-2xl" />

      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />

        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}


function AnalyticsMetric({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;

  value: string;

  description: string;

  icon:
    typeof Files;
}) {
  return (
    <Card
      className={[
        "premium-card",
        "group",

        "transition-all",
        "duration-300",

        "hover:-translate-y-1",
        "hover:border-primary/25",
      ].join(" ")}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={[
                "text-[10px]",
                "font-bold",
                "uppercase",
                "tracking-[0.12em]",
                "text-muted-foreground",
              ].join(" ")}
            >
              {title}
            </p>

            <p className="mt-3 text-3xl font-bold tracking-[-0.04em]">
              {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="premium-icon-box flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Icon className="size-4.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


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
      <AnalyticsSkeleton />
    );
  }


  if (
    analyticsQuery.isError ||
    overviewQuery.isError ||
    !analyticsQuery.data ||
    !overviewQuery.data
  ) {
    return (
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
          "via-card/85",
          "to-card",

          "p-6",

          "sm:p-7",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none",
            "absolute",
            "-right-28",
            "-top-28",

            "size-72",

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
            "gap-5",

            "sm:flex-row",
            "sm:items-end",
          ].join(" ")}
        >
          <div>
            <div className="premium-kicker">
              <TrendingUp className="size-3.5" />

              Usage Intelligence
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
              Analytics
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Understand source activity, AI output usage,
              processing outcomes and workspace trends.
            </p>
          </div>


          <div className="relative">
            <CalendarDays
              className={[
                "pointer-events-none",
                "absolute",
                "left-3.5",
                "top-1/2",

                "size-4",

                "-translate-y-1/2",

                "text-primary",
              ].join(" ")}
            />

            <select
              value={
                days
              }
              aria-label="Analytics time range"
              className={[
                "h-11",
                "min-w-[170px]",

                "appearance-none",

                "rounded-xl",

                "border",
                "border-primary/20",

                "bg-background/70",

                "pl-10",
                "pr-10",

                "text-sm",
                "font-semibold",

                "outline-none",

                "backdrop-blur-xl",

                "transition-all",

                "hover:border-primary/35",

                "focus:border-primary/50",
                "focus:ring-4",
                "focus:ring-primary/10",
              ].join(" ")}
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

            <span
              className={[
                "pointer-events-none",
                "absolute",
                "right-3.5",
                "top-1/2",

                "-translate-y-1/2",

                "text-xs",
                "text-muted-foreground",
              ].join(" ")}
            >
              ▾
            </span>
          </div>
        </div>
      </section>


      {/* =====================================================
          METRICS
          ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetric
          title="Documents"
          value={formatNumber(
            overview.total_documents
          )}
          description="Total source items in your library."
          icon={Files}
        />

        <AnalyticsMetric
          title="AI Outputs"
          value={formatNumber(
            overview.total_generated_outputs
          )}
          description="Generated communication assets."
          icon={Sparkles}
        />

        <AnalyticsMetric
          title="Exports"
          value={formatNumber(
            overview.total_exports
          )}
          description="Files generated for download."
          icon={Download}
        />

        <AnalyticsMetric
          title="Success Rate"
          value={`${overview.success_rate}%`}
          description="Successful AI transformation runs."
          icon={CheckCircle2}
        />
      </section>


      {/* =====================================================
          ACTIVITY TIMELINE
          ===================================================== */}

      <Card className="premium-card">
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
                Activity Timeline
              </CardTitle>

              <CardDescription>
                Source ingestion, transformations and export activity
                over the selected period.
              </CardDescription>
            </div>

            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary"
            >
              {days} DAYS
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {analytics.timeline.length ? (
            <div className="h-[330px]">
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
            <div className="flex h-[330px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
              <BarChart3 className="size-7 text-primary" />

              <p className="mt-3 text-sm font-semibold">
                No activity in this period
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Select a different range or create a transformation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* =====================================================
          DISTRIBUTION CHARTS
          ===================================================== */}

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="premium-card">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardTitle>
              Input Type Distribution
            </CardTitle>

            <CardDescription>
              Source formats used across your workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {analytics.input_type_distribution.length ? (
              <div className="h-[310px]">
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
                      right: 8,
                      top: 5,
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
                      fontSize={
                        10
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
                        10
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

                    <Bar
                      dataKey="count"
                      name="Sources"
                      fill="var(--chart-1)"
                      radius={[
                        8,
                        8,
                        2,
                        2,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[310px] items-center justify-center text-sm text-muted-foreground">
                No source data available.
              </div>
            )}
          </CardContent>
        </Card>


        <Card className="premium-card">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardTitle>
              Output Type Distribution
            </CardTitle>

            <CardDescription>
              Communication formats generated most often.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {analytics.output_type_distribution.length ? (
              <div className="h-[310px]">
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
                      left: 12,
                      right: 10,
                      top: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="4 4"
                      horizontal={
                        false
                      }
                      opacity={
                        0.55
                      }
                    />

                    <XAxis
                      type="number"
                      allowDecimals={
                        false
                      }
                      fontSize={
                        10
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
                      type="category"
                      dataKey="label"
                      tickFormatter={
                        humanize
                      }
                      width={
                        125
                      }
                      fontSize={
                        10
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

                    <Bar
                      dataKey="count"
                      name="Outputs"
                      fill="var(--chart-2)"
                      radius={[
                        2,
                        8,
                        8,
                        2,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[310px] items-center justify-center text-sm text-muted-foreground">
                No output data available.
              </div>
            )}
          </CardContent>
        </Card>
      </section>


      {/* =====================================================
          TRANSFORMATION HEALTH
          ===================================================== */}

      <Card className="premium-card">
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
                Transformation Health
              </CardTitle>

              <CardDescription>
                Current processing outcomes across the workspace.
              </CardDescription>
            </div>

            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary"
            >
              {overview.total_transformations} TOTAL
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid gap-6 xl:grid-cols-[0.65fr_1.35fr]">
            <div
              className={[
                "rounded-2xl",

                "border",
                "border-primary/15",

                "bg-primary/5",

                "p-5",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={[
                      "text-[10px]",
                      "font-bold",
                      "uppercase",
                      "tracking-[0.12em]",
                      "text-muted-foreground",
                    ].join(" ")}
                  >
                    Overall Success
                  </p>

                  <p className="mt-2 text-4xl font-bold tracking-[-0.05em]">
                    {overview.success_rate}
                    %
                  </p>
                </div>

                <div className="premium-icon-box flex size-12 items-center justify-center rounded-2xl">
                  <CheckCircle2 className="size-6" />
                </div>
              </div>

              <Progress
                value={
                  successRate
                }
                className="mt-6 h-2.5"
              />

              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Ratio of successfully completed transformations
                across all recorded AI runs.
              </p>
            </div>


            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {analytics.transformation_status_distribution.length ? (
                analytics.transformation_status_distribution.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.label
                      }
                      className={[
                        "relative",
                        "overflow-hidden",

                        "rounded-2xl",

                        "border",
                        "border-border/70",

                        "bg-background/55",

                        "p-5",

                        "transition-all",
                        "duration-300",

                        "hover:border-primary/25",
                        "hover:bg-primary/5",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "absolute",
                          "right-4",
                          "top-4",

                          "size-2",

                          "rounded-full",

                          item.label.toLowerCase() ===
                          "completed"
                            ? "bg-primary"
                            : item.label.toLowerCase() ===
                                "failed"
                              ? "bg-destructive"
                              : "bg-muted-foreground",
                        ].join(" ")}
                      />

                      <p
                        className={[
                          "text-[10px]",
                          "font-bold",
                          "uppercase",
                          "tracking-[0.12em]",
                          "text-muted-foreground",
                        ].join(" ")}
                      >
                        {humanize(
                          item.label
                        )}
                      </p>

                      <p className="mt-4 text-3xl font-bold tracking-[-0.04em]">
                        {
                          item.count
                        }
                      </p>
                    </div>
                  )
                )
              ) : (
                <div className="col-span-full flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                  No transformation status data available.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>


      {/* =====================================================
          SUMMARY STRIP
          ===================================================== */}

      <section
        className={[
          "grid",
          "gap-3",

          "rounded-2xl",

          "border",
          "border-border/70",

          "bg-card/65",

          "p-4",

          "backdrop-blur-xl",

          "sm:grid-cols-3",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="premium-icon-box flex size-9 items-center justify-center rounded-lg">
            <Files className="size-4" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Source Library
            </p>

            <p className="mt-0.5 text-sm font-semibold">
              {formatNumber(
                overview.total_documents
              )}{" "}
              documents
            </p>
          </div>
        </div>


        <div className="flex items-center gap-3 px-2 py-2">
          <div className="premium-icon-box flex size-9 items-center justify-center rounded-lg">
            <Sparkles className="size-4" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Content Assets
            </p>

            <p className="mt-0.5 text-sm font-semibold">
              {formatNumber(
                overview.total_generated_outputs
              )}{" "}
              generated outputs
            </p>
          </div>
        </div>


        <div className="flex items-center gap-3 px-2 py-2">
          <div className="premium-icon-box flex size-9 items-center justify-center rounded-lg">
            <Activity className="size-4" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Selected Period
            </p>

            <p className="mt-0.5 text-sm font-semibold">
              Last {days} days
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}