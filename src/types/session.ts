export interface SessionData {
  did: string;
  handle: string;
  email?: string;
  emailConfirmed?: boolean;
  accessJwt: string;
  refreshJwt: string;
  avatar?: string;
  active?: boolean;
}