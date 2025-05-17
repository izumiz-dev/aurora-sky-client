export interface UserProfile {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  indexedAt?: string;
  viewer?: {
    muted?: boolean;
    blockedBy?: boolean;
    blocking?: boolean;
    following?: string;
    followedBy?: string;
  };
  labels?: Array<{
    val: string;
    src: string;
    uri?: string;
    cid?: string;
    createdAt?: string;
  }>;
  pinnedPost?: {
    uri: string;
    cid: string;
  };
  joinedViaStarterPack?: {
    uri: string;
    cid: string;
  };
  createdAt?: string;
}

export interface ProfileViewBasic {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  viewer?: {
    muted?: boolean;
    blockedBy?: boolean;
    blocking?: boolean;
    following?: string;
    followedBy?: string;
  };
  labels?: any[];
}

export interface ProfileView extends ProfileViewBasic {
  description?: string;
  indexedAt?: string;
}