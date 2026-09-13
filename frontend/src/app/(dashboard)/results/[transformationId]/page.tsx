import type {
  Metadata,
} from "next";

import {
  ResultsWorkspace,
} from "@/components/results/results-workspace";


export const metadata: Metadata = {
  title:
    "Transformation Results",
};


interface ResultsPageProps {
  params: Promise<{
    transformationId:
      string;
  }>;
}


export default async function ResultsPage({
  params,
}: ResultsPageProps) {
  const {
    transformationId,
  } = await params;

  return (
    <ResultsWorkspace
      transformationId={
        transformationId
      }
    />
  );
}