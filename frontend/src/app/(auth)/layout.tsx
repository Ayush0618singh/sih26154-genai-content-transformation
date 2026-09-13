import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  BrainCircuit,
  FileOutput,
  ScanText,
  ShieldCheck,
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
      "Understand any source",

    description:
      "PDFs, documents, images, OCR and structured data.",
  },

  {
    icon:
      BrainCircuit,

    title:
      "Grounded AI reasoning",

    description:
      "Structured analysis with RAG and semantic retrieval.",
  },

  {
    icon:
      FileOutput,

    title:
      "Transform everywhere",

    description:
      "Reports, presentations, social content, data and video packages.",
  },

  {
    icon:
      ShieldCheck,

    title:
      "Private by design",

    description:
      "Authenticated access, RLS and private file storage.",
  },
];


export default function AuthLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--color-muted),transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-accent),transparent_35%)] opacity-60" />

      <header className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between px-5 sm:px-8 lg:px-12">
        <AppLogo />

        <ThemeToggle />
      </header>

      <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r bg-muted/20 px-12 lg:flex lg:flex-col lg:justify-center xl:px-20">
          <div className="max-w-xl">
            <div className="mb-8 inline-flex rounded-full border bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-sm backdrop-blur">
              GenAI Content Intelligence Platform
            </div>

            <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">
              Turn one source into

              <span className="block text-primary">
                every useful format.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Extract, understand, ground and transform complex content into audience-ready communication using a secure multimodal AI pipeline.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
                      className="rounded-2xl border bg-background/70 p-5 shadow-sm backdrop-blur"
                    >
                      <Icon className="mb-4 size-5 text-primary" />

                      <p className="font-semibold">
                        {
                          feature.title
                        }
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {
                          feature.description
                        }
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>


        <section className="flex min-h-screen items-center justify-center px-5 pb-10 pt-28 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}