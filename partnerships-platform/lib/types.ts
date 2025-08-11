export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name?: string; // Full name (computed from first_name + last_name)
  email: string;
  phone?: string;
  avatar?: string;
  custom_auth_token?: string; // Custom auth token for Buycycle API
}

export interface OrderImage {
  id: number;
  url: string;
  url_200?: string;
  url_350?: string;
  url_770?: string;
  sort_order: number;
}

export interface UserOrder {
  id: number;
  conversation_id?: number;
  brand?: string;
  price: number;
  price_formatted?: string;
  currency?: string;
  name: string;
  image?: OrderImage[];
  status: string;
  created_at: string;
  shipping_status?: string;
}

export interface UserSale {
  id: number;
  conversation_id?: number;
  brand?: string;
  price: number;
  price_formatted?: string;
  currency?: string;
  name: string;
  image?: OrderImage[];
  status: string;
  created_at: string;
  shipping_status?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refresh_token?: string;
  user?: User;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SocialAuthData {
  provider: 'google' | 'apple';
  access_token: string;
} 

// Database-aligned Video interface  
export interface Video {
  id: string;
  title: string;
  description?: string;
  google_drive_id: string;
  thumbnail_url?: string;
  status: 'processing' | 'ready' | 'error' | 'deleted';
  vote_count?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
  // Computed fields for frontend
  video_url: string;
  user_has_voted?: boolean;
}

// Video vote
export interface VideoVote {
  id: number;
  user_id: number;
  video_id: string;
  video_title?: string;
  created_at: string;
  updated_at: string;
}

// Pagination info
export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

// API Response types
export interface VideosResponse {
  success: boolean;
  videos: Video[];
  pagination?: PaginationInfo;
  message?: string;
}

export interface VideoResponse {
  success: boolean;
  video: Video;
  message?: string;
}

export interface VoteResponse {
  success: boolean;
  action: 'added' | 'removed' | 'changed';
  message: string;
  previousVideo?: string;
  newVideo?: string;
} 