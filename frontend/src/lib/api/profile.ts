import {
  apiClient,
} from "@/lib/api/client";

import type {
  ProfileResponse,
} from "@/types/api";


export interface ProfileUpdateRequest {
  full_name?:
    string | null;

  avatar_url?:
    string | null;
}


export async function getProfile() {
  const response =
    await apiClient.get<ProfileResponse>(
      "/profile/me"
    );

  return response.data;
}


export async function updateProfile(
  request:
    ProfileUpdateRequest
) {
  const response =
    await apiClient.patch<ProfileResponse>(
      "/profile/me",
      request
    );

  return response.data;
}