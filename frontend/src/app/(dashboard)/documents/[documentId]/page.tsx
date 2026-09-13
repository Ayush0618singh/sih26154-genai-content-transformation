import type {
  Metadata,
} from "next";

import {
  DocumentDetail,
} from "@/components/documents/document-detail";


export const metadata: Metadata = {
  title:
    "Document Detail",
};


interface DocumentDetailPageProps {
  params: Promise<{
    documentId: string;
  }>;
}


export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const {
    documentId,
  } = await params;

  return (
    <DocumentDetail
      documentId={
        documentId
      }
    />
  );
}