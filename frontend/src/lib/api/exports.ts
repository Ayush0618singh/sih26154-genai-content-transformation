import {
  apiClient,
} from "@/lib/api/client";

import type {
  DeleteResponse,
  ExportBatchResponse,
} from "@/types/api";

import type {
  ExportRequest,
  SignedDownloadResponse,
} from "@/types/requests";


export async function generateExports(
  transformationId: string,
  request: ExportRequest
) {
  const response =
    await apiClient.post<ExportBatchResponse>(
      `/exports/${transformationId}/generate`,
      request,
      {
        timeout: 600_000,
      }
    );

  return response.data;
}


export async function getExports(
  transformationId: string
) {
  const response =
    await apiClient.get<ExportBatchResponse>(
      `/exports/${transformationId}`
    );

  return response.data;
}


export async function getExportDownloadUrl(
  exportId: string
) {
  const response =
    await apiClient.get<SignedDownloadResponse>(
      `/exports/files/${exportId}/download-url`
    );

  return response.data;
}


export async function deleteExport(
  exportId: string
) {
  const response =
    await apiClient.delete<DeleteResponse>(
      `/exports/files/${exportId}`
    );

  return response.data;
}