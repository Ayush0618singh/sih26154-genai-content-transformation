export type OutputType =
  | "executive_summary"
  | "detailed_summary"
  | "advisory"
  | "linkedin"
  | "x_thread"
  | "infographic"
  | "presentation"
  | "video_script"
  | "action_items"
  | "structured_data";

export type ExportFormat =
  | "pdf"
  | "docx"
  | "pptx"
  | "json"
  | "csv"
  | "srt";

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface DocumentListItem {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  input_type: string;
  status: string;
  extraction_method:
    | string
    | null;
  page_count: number;
  character_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  items: DocumentListItem[];
  pagination: PaginationMeta;
}

export interface DocumentDetailResponse
  extends DocumentListItem {
  storage_path:
    | string
    | null;

  extracted_text:
    | string
    | null;

  metadata: Record<
    string,
    unknown
  >;

  error_message:
    | string
    | null;

  rag_status:
    | string
    | null;

  rag_chunk_count: number;

  transformation_count: number;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  input_type: string;
  mime_type: string;
  file_size: number;
  status: string;
  storage_path: string;
  extraction_method: string;
  page_count: number;
  character_count: number;
  text_preview: string;

  metadata: Record<
    string,
    unknown
  >;
}

export interface TransformationListItem {
  id: string;

  source_document_id:
    | string
    | null;

  title:
    | string
    | null;

  status: string;

  target_audience:
    | string
    | null;

  tone:
    | string
    | null;

  language: string;

  detail_level:
    | string
    | null;

  objective:
    | string
    | null;

  selected_outputs: string[];

  output_count: number;

  created_at: string;

  updated_at: string;
}

export interface TransformationListResponse {
  items: TransformationListItem[];
  pagination: PaginationMeta;
}

export interface GeneratedOutput {
  id: string;
  output_type: OutputType;
  title:
    | string
    | null;

  content_json?: Record<
    string,
    unknown
  >;

  content?: Record<
    string,
    unknown
  >;

  storage_path?:
    | string
    | null;

  mime_type?:
    | string
    | null;

  created_at?: string;
}

export interface TransformationDetailResponse {
  transformation_id: string;

  document_id:
    | string
    | null;

  title:
    | string
    | null;

  status: string;

  target_audience:
    | string
    | null;

  tone:
    | string
    | null;

  language: string;

  detail_level:
    | string
    | null;

  objective:
    | string
    | null;

  selected_outputs: string[];

  analysis: Record<
    string,
    unknown
  >;

  outputs: GeneratedOutput[];
}

export interface TransformationRequest {
  document_id: string;

  target_audience: string;

  tone: string;

  language: string;

  detail_level:
    | "concise"
    | "balanced"
    | "detailed";

  objective: string;

  selected_outputs: OutputType[];

  custom_instructions: string;

  use_rag: boolean;
}

export interface ActivityEvent {
  id: string;

  event_type: string;

  source_document_id:
    | string
    | null;

  transformation_id:
    | string
    | null;

  metadata: Record<
    string,
    unknown
  >;

  created_at: string;
}

export interface ActivityListResponse {
  items: ActivityEvent[];
  pagination: PaginationMeta;
}

export interface DashboardOverview {
  total_documents: number;

  total_transformations: number;

  total_generated_outputs: number;

  total_exports: number;

  completed_transformations: number;

  failed_transformations: number;

  success_rate: number;

  total_storage_bytes: number;

  recent_documents: DocumentListItem[];

  recent_transformations: TransformationListItem[];

  recent_activity: ActivityEvent[];
}

export interface DistributionItem {
  label: string;
  count: number;
}

export interface TimelinePoint {
  date: string;
  documents: number;
  transformations: number;
  exports: number;
}

export interface AnalyticsResponse {
  days: number;

  input_type_distribution:
    DistributionItem[];

  output_type_distribution:
    DistributionItem[];

  transformation_status_distribution:
    DistributionItem[];

  timeline: TimelinePoint[];
}

export interface ExportArtifact {
  id: string;

  transformation_id: string;

  export_format: ExportFormat;

  filename: string;

  mime_type: string;

  file_size: number;

  storage_path: string;

  signed_url:
    | string
    | null;

  expires_in:
    | number
    | null;
}

export interface ExportBatchResponse {
  transformation_id: string;
  artifacts: ExportArtifact[];
}

export interface ProfileResponse {
  id: string;

  email:
    | string
    | null;

  full_name:
    | string
    | null;

  avatar_url:
    | string
    | null;

  role: string;

  created_at:
    | string
    | null;

  updated_at:
    | string
    | null;
}

export interface DeleteResponse {
  id: string;
  status: string;
  message: string;
}