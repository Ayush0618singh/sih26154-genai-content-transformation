import Link from "next/link";

import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileOutput,
  FileScan,
  Image,
  Languages,
  Layers3,
  LockKeyhole,
  Presentation,
  ShieldCheck,
  Sparkles,
  Table2,
  Video,
  WandSparkles,
  Zap,
} from "lucide-react";

import {
  AppLogo,
} from "@/components/shared/app-logo";

import {
  ThemeToggle,
} from "@/components/shared/theme-toggle";

import {
  Badge,
} from "@/components/ui/badge";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  cn,
} from "@/lib/utils";


interface LandingPageProps {
  signedIn: boolean;
}


const capabilities = [
  {
    icon:
      FileScan,

    title:
      "Multimodal Ingestion",

    description:
      "Understand PDF, DOCX, text, images, spreadsheets, JSON and other structured sources.",
  },

  {
    icon:
      BrainCircuit,

    title:
      "Content Intelligence",

    description:
      "Extract topics, facts, entities, metrics, risks, recommendations and decision context.",
  },

  {
    icon:
      Database,

    title:
      "RAG Grounding",

    description:
      "Retrieve relevant source evidence before generating content to improve grounding and traceability.",
  },

  {
    icon:
      Languages,

    title:
      "Audience Adaptation",

    description:
      "Control audience, language, tone, detail level and communication objective.",
  },

  {
    icon:
      FileOutput,

    title:
      "Multi-format Generation",

    description:
      "Turn a single source into summaries, advisories, presentations, social content and structured outputs.",
  },

  {
    icon:
      ShieldCheck,

    title:
      "Security by Design",

    description:
      "Private storage, authenticated APIs, per-user isolation, RLS and temporary signed downloads.",
  },
];


const outputTypes = [
  "Executive Summary",
  "Detailed Summary",
  "Advisory",
  "LinkedIn",
  "X Thread",
  "Infographic",
  "Presentation",
  "Video Script",
  "Action Items",
  "Structured Data",
];


const pipeline = [
  {
    number:
      "01",

    title:
      "Ingest",

    description:
      "Documents, images, video and structured data.",
  },

  {
    number:
      "02",

    title:
      "Understand",

    description:
      "Multimodal extraction and structured AI analysis.",
  },

  {
    number:
      "03",

    title:
      "Ground",

    description:
      "Semantic retrieval connects generation to evidence.",
  },

  {
    number:
      "04",

    title:
      "Transform",

    description:
      "Generate audience-ready communication assets.",
  },
];


export function LandingPage({
  signedIn,
}: LandingPageProps) {
  return (
    <div className="premium-page min-h-screen overflow-hidden bg-background">
      {/* Header */}
      <header
        className={[
          "sticky",
          "top-0",
          "z-50",

          "border-b",
          "border-border/60",

          "bg-background/78",
          "backdrop-blur-2xl",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto",
            "flex",
            "h-[76px]",
            "max-w-7xl",
            "items-center",
            "justify-between",
            "gap-4",

            "px-5",
            "sm:px-6",
            "lg:px-8",
          ].join(" ")}
        >
          <AppLogo />

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {signedIn ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({
                    variant:
                      "default",

                    size:
                      "lg",
                  }),

                  "hidden sm:inline-flex"
                )}
              >
                Open Dashboard

                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({
                      variant:
                        "ghost",
                    }),

                    "hidden sm:inline-flex"
                  )}
                >
                  Sign in
                </Link>

                <Link
                  href="/signup"
                  className={buttonVariants({
                    variant:
                      "default",

                    size:
                      "lg",
                  })}
                >
                  Get Started

                  <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>


      <main>
        {/* HERO */}
        <section className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-[-16rem] size-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

            <div className="absolute -left-52 top-[26rem] size-[460px] rounded-full bg-primary/6 blur-[120px]" />

            <div className="absolute -right-52 top-40 size-[460px] rounded-full bg-primary/6 blur-[120px]" />
          </div>


          <div
            className={[
              "mx-auto",
              "grid",
              "max-w-7xl",
              "items-center",
              "gap-16",

              "px-5",
              "py-20",

              "sm:px-6",
              "sm:py-24",

              "lg:grid-cols-[1.04fr_0.96fr]",
              "lg:px-8",
              "lg:py-28",
            ].join(" ")}
          >
            <div>
              <div className="premium-kicker">
                <Sparkles className="size-3.5" />

                SIH26154 · GenAI Content Intelligence
              </div>

              <h1
                className={[
                  "mt-7",
                  "max-w-3xl",

                  "text-4xl",
                  "font-bold",
                  "leading-[1.06]",
                  "tracking-[-0.055em]",

                  "sm:text-5xl",
                  "lg:text-[4.1rem]",
                ].join(" ")}
              >
                One source.

                <span className="gold-text block">
                  Every useful format.
                </span>
              </h1>

              <p
                className={[
                  "mt-7",
                  "max-w-2xl",

                  "text-base",
                  "leading-8",
                  "text-muted-foreground",

                  "sm:text-lg",
                ].join(" ")}
              >
                TransformAI understands complex source content,
                grounds generation in retrieved evidence and creates
                professional communication for different audiences,
                channels and objectives.
              </p>


              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={
                    signedIn
                      ? "/transform"
                      : "/signup"
                  }
                  className={cn(
                    buttonVariants({
                      size:
                        "lg",
                    }),

                    "h-12 px-6"
                  )}
                >
                  <WandSparkles className="size-4" />

                  {signedIn
                    ? "Start Transforming"
                    : "Create Workspace"}

                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href={
                    signedIn
                      ? "/dashboard"
                      : "/login"
                  }
                  className={cn(
                    buttonVariants({
                      variant:
                        "outline",

                      size:
                        "lg",
                    }),

                    "h-12 px-6"
                  )}
                >
                  {signedIn
                    ? "View Dashboard"
                    : "Sign In"}
                </Link>
              </div>


              <div
                className={[
                  "mt-9",
                  "flex",
                  "flex-wrap",
                  "gap-x-6",
                  "gap-y-3",

                  "text-xs",
                  "font-medium",
                  "text-muted-foreground",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />

                  Private storage
                </span>

                <span className="flex items-center gap-2">
                  <Database className="size-4 text-primary" />

                  RAG grounded
                </span>

                <span className="flex items-center gap-2">
                  <Languages className="size-4 text-primary" />

                  Audience adaptive
                </span>
              </div>
            </div>


            {/* Hero product preview */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/10 blur-3xl" />

              <Card
                className={[
                  "premium-card",
                  "overflow-hidden",

                  "border-primary/20",

                  "shadow-[0_40px_120px_-65px_rgba(0,0,0,0.65)]",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex",
                    "items-center",
                    "justify-between",
                    "gap-4",

                    "border-b",
                    "border-border/70",

                    "bg-muted/20",

                    "px-5",
                    "py-4",
                  ].join(" ")}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />

                      <p className="text-sm font-semibold">
                        Transformation Pipeline
                      </p>
                    </div>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Source → Intelligence → Grounding → Output
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className="border border-primary/20 bg-primary/10 text-primary"
                  >
                    LIVE AI
                  </Badge>
                </div>


                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div
                    className={[
                      "rounded-2xl",

                      "border",
                      "border-border/70",

                      "bg-background/70",

                      "p-4",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="premium-icon-box size-10 rounded-xl">
                        <FileScan className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          Multimodal Source
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          PDF · DOCX · Image · Video · CSV · XLSX · JSON
                        </p>
                      </div>
                    </div>
                  </div>


                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-background/65 p-4">
                      <BrainCircuit className="size-5 text-primary" />

                      <p className="mt-4 text-sm font-semibold">
                        Content Intelligence
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Facts, topics, metrics, entities, risks and evidence.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background/65 p-4">
                      <Database className="size-5 text-primary" />

                      <p className="mt-4 text-sm font-semibold">
                        Retrieval Grounding
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Semantic retrieval connects outputs to source context.
                      </p>
                    </div>
                  </div>


                  <div
                    className={[
                      "rounded-2xl",

                      "border",
                      "border-primary/20",

                      "bg-primary/7",

                      "p-4",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Presentation className="size-5 text-primary" />

                        <div>
                          <p className="text-sm font-semibold">
                            Audience-ready Output
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Executive Summary · Presentation · Advisory
                          </p>
                        </div>
                      </div>

                      <CheckCircle2 className="size-5 text-primary" />
                    </div>
                  </div>


                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        icon:
                          Image,

                        label:
                          "Vision",
                      },

                      {
                        icon:
                          Video,

                        label:
                          "Video",
                      },

                      {
                        icon:
                          Table2,

                        label:
                          "Data",
                      },
                    ].map(
                      (
                        item
                      ) => {
                        const Icon =
                          item.icon;

                        return (
                          <div
                            key={
                              item.label
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-2 py-2.5 text-[11px] font-semibold text-muted-foreground"
                          >
                            <Icon className="size-3.5 text-primary" />

                            {
                              item.label
                            }
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        {/* Pipeline */}
        <section className="border-y border-border/60 bg-muted/15">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="premium-kicker">
                  <Layers3 className="size-3.5" />

                  Intelligent Pipeline
                </div>

                <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
                  From raw content to useful communication.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Each stage is engineered to preserve context,
                improve grounding and deliver structured results.
              </p>
            </div>


            <div className="grid gap-3 md:grid-cols-4">
              {pipeline.map(
                (
                  step
                ) => (
                  <div
                    key={
                      step.number
                    }
                    className={[
                      "premium-card",
                      "relative",
                      "rounded-2xl",
                      "p-5",
                    ].join(" ")}
                  >
                    <span className="text-xs font-bold tracking-[0.15em] text-primary">
                      {
                        step.number
                      }
                    </span>

                    <h3 className="mt-5 text-base font-semibold">
                      {
                        step.title
                      }
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {
                        step.description
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>


        {/* Capabilities */}
        <section
          id="capabilities"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <div className="premium-kicker">
              <Zap className="size-3.5" />

              Platform Capabilities
            </div>

            <h2
              className={[
                "mt-5",
                "text-3xl",
                "font-bold",
                "tracking-[-0.045em]",

                "sm:text-4xl",
              ].join(" ")}
            >
              Built for real-world content transformation.
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              A complete AI workflow covering ingestion, understanding,
              grounding, generation, export and secure management.
            </p>
          </div>


          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(
              (
                capability
              ) => {
                const Icon =
                  capability.icon;

                return (
                  <Card
                    key={
                      capability.title
                    }
                    className={[
                      "group",
                      "premium-card",
                      "p-0",

                      "transition-all",
                      "duration-300",

                      "hover:-translate-y-1",
                      "hover:border-primary/25",
                    ].join(" ")}
                  >
                    <CardContent className="p-6">
                      <div className="premium-icon-box size-11 rounded-xl">
                        <Icon className="size-5" />
                      </div>

                      <h3 className="mt-5 text-base font-semibold tracking-[-0.02em]">
                        {
                          capability.title
                        }
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {
                          capability.description
                        }
                      </p>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>
        </section>


        {/* Outputs */}
        <section className="border-y border-border/60 bg-muted/15">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">
            <div>
              <div className="premium-kicker">
                <FileOutput className="size-3.5" />

                One Source
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                Publish across formats without losing context.
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
                Configure audience, tone, language, objective and
                detail once, then generate channel-ready outputs
                grounded in the same source intelligence.
              </p>
            </div>


            <div className="grid gap-3 sm:grid-cols-2">
              {outputTypes.map(
                (
                  output,
                  index
                ) => (
                  <div
                    key={
                      output
                    }
                    className={[
                      "flex",
                      "items-center",
                      "gap-3",

                      "rounded-xl",

                      "border",
                      "border-border/70",

                      "bg-card/70",

                      "px-4",
                      "py-3.5",

                      "backdrop-blur-xl",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex",
                        "size-7",
                        "shrink-0",
                        "items-center",
                        "justify-center",

                        "rounded-lg",

                        "bg-primary/10",

                        "text-[10px]",
                        "font-bold",
                        "text-primary",
                      ].join(" ")}
                    >
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <span className="text-sm font-semibold">
                      {output}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>


        {/* Security */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Card className="premium-card relative overflow-hidden border-primary/20">
            <div className="pointer-events-none absolute -right-40 -top-40 size-[420px] rounded-full bg-primary/10 blur-[100px]" />

            <CardContent className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:p-12">
              <div>
                <div className="premium-kicker">
                  <LockKeyhole className="size-3.5" />

                  Secure Architecture
                </div>

                <h2 className="mt-5 max-w-xl text-3xl font-bold tracking-[-0.045em]">
                  AI capability without treating privacy as an afterthought.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                  Authentication, row-level security, user-scoped
                  data access, private storage, signed download URLs
                  and upload validation are built into the platform.
                </p>
              </div>


              <div className="grid gap-3">
                {[
                  "Authenticated API access",
                  "Per-user database isolation",
                  "Private source and output storage",
                  "Temporary signed download URLs",
                  "File signature and upload validation",
                ].map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item
                      }
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/55 px-4 py-3"
                    >
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />

                      <span className="text-sm font-medium">
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </section>


        {/* CTA */}
        <section className="px-5 pb-20 sm:px-6 lg:px-8 lg:pb-24">
          <div
            className={[
              "relative",
              "mx-auto",
              "max-w-7xl",
              "overflow-hidden",

              "rounded-[2rem]",

              "border",
              "border-primary/25",

              "bg-gradient-to-br",
              "from-primary/12",
              "via-card",
              "to-card",

              "px-6",
              "py-12",

              "text-center",

              "sm:px-10",
              "sm:py-16",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute left-1/2 top-[-15rem] size-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" />

            <div className="relative">
              <Sparkles className="mx-auto size-6 text-primary" />

              <h2 className="mt-5 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                Turn information into impact.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                Start with one source and create grounded,
                professional communication across multiple formats.
              </p>

              <Link
                href={
                  signedIn
                    ? "/transform"
                    : "/signup"
                }
                className={cn(
                  buttonVariants({
                    size:
                      "lg",
                  }),

                  "mt-7 h-12 px-7"
                )}
              >
                <WandSparkles className="size-4" />

                {signedIn
                  ? "Open Transform Studio"
                  : "Create Your Workspace"}

                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>


      {/* Footer */}
      <footer className="border-t border-border/60">
        <div
          className={[
            "mx-auto",
            "flex",
            "max-w-7xl",
            "flex-col",
            "gap-4",

            "px-5",
            "py-8",

            "sm:px-6",

            "md:flex-row",
            "md:items-center",
            "md:justify-between",

            "lg:px-8",
          ].join(" ")}
        >
          <AppLogo />

          <p className="text-xs text-muted-foreground">
            SIH26154 · GenAI Platform for Automated Content Transformation
          </p>
        </div>
      </footer>
    </div>
  );
}