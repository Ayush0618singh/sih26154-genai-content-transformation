import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  BrainCircuit,
  Database,
  FileOutput,
  ScanText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  AppLogo,
} from "@/components/shared/app-logo";

import {
  ThemeToggle,
} from "@/components/shared/theme-toggle";


export const metadata: Metadata = {
  title:
    "Account",

  description:
    "Sign in or create your TransformAI workspace.",
};


const features = [
  {
    icon:
      ScanText,

    title:
      "Multimodal Intelligence",

    description:
      "Documents, images, video, OCR and structured data.",
  },

  {
    icon:
      BrainCircuit,

    title:
      "Grounded AI",

    description:
      "Gemini analysis with evidence-aware RAG retrieval.",
  },

  {
    icon:
      FileOutput,

    title:
      "Multi-format Creation",

    description:
      "Summaries, reports, presentations, social and structured outputs.",
  },

  {
    icon:
      ShieldCheck,

    title:
      "Private by Design",

    description:
      "Authentication, RLS, private storage and signed downloads.",
  },
];


export default function AuthLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div className="premium-page relative min-h-screen overflow-hidden bg-background">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className={[
            "absolute",
            "-left-48",
            "-top-48",
            "size-[520px]",
            "rounded-full",
            "bg-primary/10",
            "blur-[110px]",
          ].join(" ")}
        />

        <div
          className={[
            "absolute",
            "-bottom-64",
            "right-[-12rem]",
            "size-[620px]",
            "rounded-full",
            "bg-primary/8",
            "blur-[130px]",
          ].join(" ")}
        />
      </div>


      {/* Header */}
      <header
        className={[
          "absolute",
          "inset-x-0",
          "top-0",
          "z-30",

          "flex",
          "h-20",
          "items-center",
          "justify-between",

          "px-5",
          "sm:px-8",
          "lg:px-12",
        ].join(" ")}
      >
        <AppLogo />

        <ThemeToggle />
      </header>


      <main
        className={[
          "grid",
          "min-h-screen",

          "lg:grid-cols-[1.08fr_0.92fr]",
        ].join(" ")}
      >
        {/* Left marketing panel */}
        <section
          className={[
            "relative",
            "hidden",
            "overflow-hidden",

            "border-r",
            "border-border/60",

            "lg:flex",
            "lg:flex-col",
            "lg:justify-center",

            "px-12",
            "xl:px-20",
          ].join(" ")}
        >
          <div
            className={[
              "absolute",
              "inset-8",
              "-z-10",

              "rounded-[2.5rem]",

              "border",
              "border-primary/10",

              "bg-gradient-to-br",
              "from-primary/8",
              "via-card/25",
              "to-transparent",
            ].join(" ")}
          />

          <div className="mx-auto w-full max-w-2xl">
            <div className="premium-kicker">
              <Sparkles className="size-3.5" />

              SIH26154 · Generative AI
            </div>

            <h1
              className={[
                "mt-7",
                "max-w-xl",

                "text-4xl",
                "font-bold",
                "leading-[1.08]",
                "tracking-[-0.045em]",

                "xl:text-[3.3rem]",
              ].join(" ")}
            >
              Intelligence in.

              <span className="gold-text block">
                Impact out.
              </span>
            </h1>

            <p
              className={[
                "mt-6",
                "max-w-xl",

                "text-base",
                "leading-7",
                "text-muted-foreground",
              ].join(" ")}
            >
              TransformAI converts complex source material into
              grounded, audience-ready communication using multimodal
              ingestion, AI analysis, retrieval and structured
              generation.
            </p>


            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {features.map(
                (
                  feature
                ) => {
                  const Icon =
                    feature.icon;

                  return (
                    <div
                      key={
                        feature.title
                      }
                      className={[
                        "group",
                        "rounded-2xl",

                        "border",
                        "border-border/70",

                        "bg-card/55",

                        "p-4",

                        "backdrop-blur-xl",

                        "transition-all",
                        "duration-300",

                        "hover:-translate-y-0.5",
                        "hover:border-primary/25",
                        "hover:bg-card/80",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "premium-icon-box",
                          "size-9",
                          "rounded-xl",
                        ].join(" ")}
                      >
                        <Icon className="size-4" />
                      </div>

                      <h2
                        className={[
                          "mt-4",
                          "text-sm",
                          "font-semibold",
                          "tracking-[-0.02em]",
                        ].join(" ")}
                      >
                        {
                          feature.title
                        }
                      </h2>

                      <p
                        className={[
                          "mt-1.5",
                          "text-xs",
                          "leading-5",
                          "text-muted-foreground",
                        ].join(" ")}
                      >
                        {
                          feature.description
                        }
                      </p>
                    </div>
                  );
                }
              )}
            </div>


            <div className="mt-8 gold-divider" />

            <div
              className={[
                "mt-6",
                "flex",
                "flex-wrap",
                "items-center",
                "gap-x-6",
                "gap-y-3",

                "text-[11px]",
                "font-semibold",
                "uppercase",
                "tracking-[0.12em]",
                "text-muted-foreground",
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />

                Secure
              </span>

              <span className="flex items-center gap-2">
                <Database className="size-4 text-primary" />

                RAG Grounded
              </span>

              <span className="flex items-center gap-2">
                <BrainCircuit className="size-4 text-primary" />

                AI Powered
              </span>
            </div>
          </div>
        </section>


        {/* Form */}
        <section
          className={[
            "relative",
            "flex",
            "min-h-screen",
            "items-center",
            "justify-center",

            "px-5",
            "pb-10",
            "pt-28",

            "sm:px-8",
            "lg:px-12",
          ].join(" ")}
        >
          <div className="w-full max-w-[440px]">
            {children}

            <div
              className={[
                "mt-7",
                "flex",
                "items-center",
                "justify-center",
                "gap-2",

                "text-[11px]",
                "text-muted-foreground",
              ].join(" ")}
            >
              <ShieldCheck className="size-3.5 text-primary" />

              Protected by secure authentication and private data isolation
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}