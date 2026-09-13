import { apiClient } from "@/lib/api/client";

import type {
  ActivityListResponse,
  AnalyticsResponse,
  DashboardOverview,
} from "@/types/api";

export async function getDashboardOverview() {
  const response =
    await apiClient.get<DashboardOverview>(
      "/dashboard/overview"
    );

  return response.data;
}

export async function getDashboardAnalytics(
  days = 14
) {
  const response =
    await apiClient.get<AnalyticsResponse>(
      "/dashboard/analytics",
      {
        params: {
          days,
        },
      }
    );

  return response.data;
}

export async function getDashboardActivity(
  page = 1,
  pageSize = 20
) {
  const response =
    await apiClient.get<ActivityListResponse>(
      "/dashboard/activity",
      {
        params: {
          page,
          page_size:
            pageSize,
        },
      }
    );

  return response.data;
}