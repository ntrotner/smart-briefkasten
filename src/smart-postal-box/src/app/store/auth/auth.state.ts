export interface AuthState {
  isLoggedIn: boolean;
  deviceToken: string | null;
  deviceJwt: string | null;
  baseUrl: string | null;
  lastLoginTime: number;
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  deviceToken: null,
  deviceJwt: null,
  baseUrl: 'http://0.0.0.0:8080', // Default fallback URL
  lastLoginTime: 0
}; 