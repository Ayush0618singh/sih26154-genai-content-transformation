import {
  apiClient,
} from "@/lib/api/client";

import type {
  DeleteResponse,
  TransformationDetailResponse,
  TransformationListResponse,
  TransformationRequest,
} from "@/types/api";

import type {
  TransformationCreateResponse,
} from "@/types/requests";


interface TransformationListParams {
  page?: number;

  pageSize?: number;

  status?: string;
}


export async function createTransformation(
  request:
    TransformationRequest
) {
  const response =
    await apiClient.post<TransformationCreateResponse>(
      "/transformations",
      request,
      {
        /*
         * Analysis + RAG indexing +
         * multiple parallel Gemini
         * generations may exceed the
         * standard request timeout.
         */
        timeout: 900_000,
      }
    );

  return response.data;
}


export async function getTransformations(
  params:
    TransformationListParams = {}
) {
  const response =
    await apiClient.get<TransformationListResponse>(
      "/transformations",
      {
        params: {
          page:
            params.page ?? 1,

          page_size:
            params.pageSize ??
            20,

          status:
            params.status,
        },
      }
    );

  return response.data;
}


export async function getTransformation(
  transformationId: string
) {
  const response =
    await apiClient.get<TransformationDetailResponse>(
      `/transformations/${transformationId}`
    );

  return response.data;
}


export async function deleteTransformation(
  transformationId: string
) {
  const response =
    await apiClient.delete<DeleteResponse>(
      `/transformations/${transformationId}`
    );

  return response.data;
}