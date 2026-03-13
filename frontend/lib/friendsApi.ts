import { apiGet, apiPost } from "./api";

export interface FriendProfile {
  id: string;
  name: string;
  avatar_url: string;
  bio: string | null;
  email: string | null;
  location: string | null;
}

export interface FriendRequest {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  responded_at: string | null;
  from_profile?: FriendProfile | null;
  to_profile?: FriendProfile | null;
}

export function listFriendRequests(): Promise<FriendRequest[]> {
  return apiGet<FriendRequest[]>("/api/v1/friends/requests");
}

export function listFriends(): Promise<FriendProfile[]> {
  return apiGet<FriendProfile[]>("/api/v1/friends");
}

export function discoverProfiles(query?: string): Promise<FriendProfile[]> {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiGet<FriendProfile[]>(`/api/v1/friends/discover${suffix}`);
}

export function sendFriendRequest(targetProfileId: string): Promise<FriendRequest> {
  return apiPost<FriendRequest>(`/api/v1/friends/requests/${targetProfileId}`);
}

export function acceptFriendRequest(requestId: string): Promise<FriendRequest> {
  return apiPost<FriendRequest>(`/api/v1/friends/requests/${requestId}/accept`);
}

export function rejectFriendRequest(requestId: string): Promise<FriendRequest> {
  return apiPost<FriendRequest>(`/api/v1/friends/requests/${requestId}/reject`);
}
