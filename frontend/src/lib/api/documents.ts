import {
  apiClient,
} from "@/lib/api/client";

import type {
  DeleteResponse,
  DocumentDetailResponse,
  DocumentListResponse,
  DocumentUploadResponse,
} from "@/types/api";

import type {
  TextDocumentCreateRequest,
} from "@/types/requests";


interface GetDocumentsParams {
  page?: number;

  pageSize?: number;

  status?: string;

  inputType?: string;

  search?: string;
}


export async function uploadDocument(
  file: File,
  ocrLanguage = "en"
) {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "ocr_language",
    ocrLanguage
  );

  const response =
    await apiClient.post<DocumentUploadResponse>(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },

        /*
         * OCR on scanned PDFs/images
         * can legitimately take time.
         */
        timeout: 600_000,
      }
    );

  return response.data;
}


export async function createTextDocument(
  request:
    TextDocumentCreateRequest
) {
  const response =
    await apiClient.post<DocumentDetailResponse>(
      "/documents/text",
      request
    );

  return response.data;
}


export async function getDocuments(
  params:
    GetDocumentsParams = {}
) {
  const response =
    await apiClient.get<DocumentListResponse>(
      "/documents",
      {
        params: {
          page:
            params.page ?? 1,

          page_size:
            params.pageSize ??
            20,

          status:
            params.status,

          input_type:
            params.inputType,

          search:
            params.search,
        },
      }
    );

  return response.data;
}


export async function getDocument(
  documentId: string
) {
  const response =
    await apiClient.get<DocumentDetailResponse>(
      `/documents/${documentId}`
    );

  return response.data;
}


export async function deleteDocument(
  documentId: string
) {
  const response =
    await apiClient.delete<DeleteResponse>(
      `/documents/${documentId}`
    );

  return response.data;
}