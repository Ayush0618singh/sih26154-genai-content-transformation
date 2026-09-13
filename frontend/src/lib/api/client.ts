import axios, {
  AxiosError,
} from "axios";

import {
  createClient,
} from "@/lib/supabase/client";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";


export const apiClient =
  axios.create({
    baseURL: API_URL,

    timeout: 120_000,

    headers: {
      Accept:
        "application/json",
    },
  });


apiClient.interceptors.request.use(
  async (config) => {
    const supabase =
      createClient();

    /*
     * We only retrieve the current
     * access token here.
     *
     * FastAPI independently verifies
     * the token on the backend.
     */
    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();

    if (
      session?.access_token
    ) {
      config.headers.Authorization =
        `Bearer ${session.access_token}`;
    }

    return config;
  }
);


apiClient.interceptors.response.use(
  (response) => response,

  async (
    error: AxiosError
  ) => {
    if (
      error.response?.status ===
        401 &&
      typeof window !==
        "undefined"
    ) {
      const supabase =
        createClient();

      await supabase.auth.signOut();

      const loginUrl =
        new URL(
          "/login",
          window.location.origin
        );

      window.location.replace(
        loginUrl.toString()
      );
    }

    return Promise.reject(
      error
    );
  }
);


export function getApiErrorMessage(
  error: unknown
): string {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    const data =
      error.response?.data;

    if (
      typeof data ===
        "object" &&
      data !== null &&
      "detail" in data
    ) {
      const detail = (
        data as {
          detail?: unknown;
        }
      ).detail;

      if (
        typeof detail ===
        "string"
      ) {
        return detail;
      }

      if (
        typeof detail ===
          "object" &&
        detail !== null
      ) {
        try {
          return JSON.stringify(
            detail
          );
        } catch {
          return (
            "Request failed."
          );
        }
      }
    }

    return (
      error.message ||
      "Request failed."
    );
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return (
    "Something went wrong."
  );
}