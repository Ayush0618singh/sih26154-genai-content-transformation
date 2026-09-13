import type {
  ExportFormat,
  GeneratedOutput,
  OutputType,
} from "@/types/api";


export interface TextDocumentCreateRequest {
  title: string;

  content: string;

  language?: string;
}


export interface TransformationCreateResponse {
  transformation_id: string;

  document_id: string;

  status: string;

  analysis: Record<
    string,
    unknown
  >;

  outputs: GeneratedOutput[];
}


export interface ExportRequest {
  formats: ExportFormat[];

  include_output_types?:
    OutputType[] | null;
}


export interface SignedDownloadResponse {
  export_id: string;

  filename: string;

  signed_url: string;

  expires_in: number;
}