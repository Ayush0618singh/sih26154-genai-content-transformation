import type {
  Metadata,
} from "next";

import "./globals.css";

import {
  AppProviders,
} from "@/providers/app-providers";


const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";


export const metadata: Metadata = {
  metadataBase:
    new URL(
      siteUrl
    ),

  title: {
    default:
      "TransformAI | GenAI Content Transformation",

    template:
      "%s | TransformAI",
  },

  description:
    "A secure GenAI platform for transforming documents, reports, images and structured source content into audience-ready summaries, advisories, presentations, social content and downloadable assets.",

  applicationName:
    "TransformAI",

  authors: [
    {
      name:
        "SIH26154 Team",
    },
  ],

  creator:
    "SIH26154 Team",

  keywords: [
    "Generative AI",
    "Content Transformation",
    "Smart India Hackathon",
    "SIH26154",
    "RAG",
    "Document AI",
    "OCR",
    "Gemini",
    "Content Intelligence",
    "Multilingual AI",
  ],

  openGraph: {
    type:
      "website",

    siteName:
      "TransformAI",

    title:
      "TransformAI | GenAI Content Transformation",

    description:
      "Transform complex source content into grounded, audience-ready communication assets using AI and retrieval.",

    url:
      siteUrl,
  },

  twitter: {
    card:
      "summary",

    title:
      "TransformAI | GenAI Content Transformation",

    description:
      "AI-powered content intelligence, RAG grounding and multi-format transformation.",
  },

  robots: {
    index:
      true,

    follow:
      true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}