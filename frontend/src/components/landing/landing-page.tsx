import Link from "next/link";

import {
  ArrowRight,
  BrainCircuit,
  Database,
  FileOutput,
  FileScan,
  Languages,
  LockKeyhole,
  Presentation,
  ShieldCheck,
  Sparkles,
  Video,
  WandSparkles,
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
    icon: FileScan,

    title:
      "Multimodal ingestion",

    description:
      "Process PDFs, DOCX files, text, images and structured tabular data through one ingestion pipeline.",
  },

  {
    icon: BrainCircuit,

    title:
      "Content intelligence",

    description:
      "Extract important topics, entities, facts, risks, metrics and decision-ready context.",
  },

  {
    icon: Database,

    title:
      "RAG grounded generation",

    description:
      "Chunk, embed and retrieve relevant source evidence before generating transformed content.",
  },

  {
    icon: Languages,

    title:
      "Audience adaptation",

    description:
      "Control target audience, language, tone, detail level and communication objective.",
  },

  {
    icon: FileOutput,

    title:
      "Multi-format outputs",

    description:
      "Generate summaries, advisories, social content, presentations, structured data and action items.",
  },

  {
    icon: ShieldCheck,

    title:
      "Secure workspace",

    description:
      "Authenticated access, per-user isolation, private storage and temporary signed downloads.",
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
  "Video Package",
  "Action Items",
  "Structured Data",
];


export function LandingPage({
  signedIn,
}: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
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
                  }),
                  "hidden sm:inline-flex"
                )}
              >
                Open Dashboard

                <ArrowRight className="ml-2 size-4" />
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
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({
                      variant:
                        "default",
                    })
                  )}
                >
                  Get Started

                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>


      <main>
        <section className="relative">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[500px] w-[850px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

            <div className="absolute -left-40 top-80 size-[420px] rounded-full bg-muted blur-3xl" />

            <div className="absolute -right-40 top-48 size-[420px] rounded-full bg-accent blur-3xl" />
          </div>

          <div className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
            <div>
              <Badge
                variant="secondary"
                className="gap-2 px-3 py-1.5"
              >
                <Sparkles className="size-3.5" />

                SIH26154 · GenAI Content Transformation
              </Badge>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                Transform complex
                content into
                <span className="block text-primary">
                  communication that matters.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                An AI-powered platform that understands source content, grounds generation using retrieval, adapts communication for different audiences and creates multiple publication-ready formats from a single source.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
                  <WandSparkles className="mr-2 size-4" />

                  {signedIn
                    ? "Start Transforming"
                    : "Create Workspace"}

                  <ArrowRight className="ml-2 size-4" />
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

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />

                  Private storage
                </span>

                <span className="flex items-center gap-2">
                  <Database className="size-4 text-primary" />

                  RAG grounding
                </span>

                <span className="flex items-center gap-2">
                  <Languages className="size-4 text-primary" />

                  Multilingual
                </span>
              </div>
            </div>


            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />

              <Card className="overflow-hidden border-border/70 bg-card/90 shadow-2xl shadow-black/10 backdrop-blur">
                <div className="border-b bg-muted/20 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Transformation Pipeline
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Source → Intelligence → Grounding → Outputs
                      </p>
                    </div>

                    <Badge variant="secondary">
                      AI
                    </Badge>
                  </div>
                </div>

                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="rounded-2xl border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileScan className="size-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Source Intelligence
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          OCR · Documents · Images · Structured Data
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-background p-4">
                      <BrainCircuit className="size-5 text-primary" />

                      <p className="mt-4 text-sm font-semibold">
                        AI Analysis
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Facts, entities, metrics, topics and risks.
                      </p>
                    </div>

                    <div className="rounded-2xl border bg-background p-4">
                      <Database className="size-5 text-primary" />

                      <p className="mt-4 text-sm font-semibold">
                        RAG Context
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Semantic retrieval from the original source.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Generated Assets
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        "Summary",
                        "Advisory",
                        "LinkedIn",
                        "Presentation",
                        "Infographic",
                        "Video Script",
                      ].map(
                        (
                          item
                        ) => (
                          <Badge
                            key={
                              item
                            }
                            variant="outline"
                            className="bg-background"
                          >
                            {
                              item
                            }
                          </Badge>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border bg-background p-3 text-center">
                      <FileOutput className="mx-auto size-4 text-primary" />

                      <p className="mt-2 text-[11px] font-medium">
                        PDF / DOCX
                      </p>
                    </div>

                    <div className="rounded-xl border bg-background p-3 text-center">
                      <Presentation className="mx-auto size-4 text-primary" />

                      <p className="mt-2 text-[11px] font-medium">
                        PPTX
                      </p>
                    </div>

                    <div className="rounded-xl border bg-background p-3 text-center">
                      <Video className="mx-auto size-4 text-primary" />

                      <p className="mt-2 text-[11px] font-medium">
                        SRT
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline">
                Core Capabilities
              </Badge>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                One platform. One source. Many useful outcomes.
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                The pipeline combines content extraction, structured intelligence, semantic retrieval and controlled generation instead of treating content transformation as a simple chatbot prompt.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                      className="border-border/70"
                    >
                      <CardContent className="p-6">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>

                        <h3 className="mt-5 font-semibold">
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
          </div>
        </section>


        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <Badge variant="secondary">
                Multi-output Engine
              </Badge>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Communicate the same intelligence differently for every channel.
              </h2>

              <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
                Choose the audience, tone, language, objective and detail level once. The platform then produces multiple structured communication assets while preserving the important source context.
              </p>

              <div className="mt-7 rounded-2xl border bg-muted/20 p-5">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-semibold">
                      Privacy-conscious architecture
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      User-owned records, authenticated APIs, Row Level Security, private object storage and temporary download URLs keep workspace data isolated.
                    </p>
                  </div>
                </div>
              </div>
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
                    className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p className="text-sm font-semibold">
                      {
                        output
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>


        <section className="border-t bg-muted/20">
          <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-6 lg:px-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="size-7" />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              From raw source to usable communication.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Build grounded summaries, advisories, presentations, publication content and structured assets from one secure workspace.
            </p>

            <div className="mt-8 flex justify-center">
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
                  "h-12 px-7"
                )}
              >
                <WandSparkles className="mr-2 size-4" />

                {signedIn
                  ? "Open Transform Studio"
                  : "Start Transforming"}

                <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>


      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
          <AppLogo />

          <div className="text-sm text-muted-foreground">
            GenAI Platform for Automated Content Transformation · SIH26154
          </div>
        </div>
      </footer>
    </div>
  );
}