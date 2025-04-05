export interface AuthState {
  isLoggedIn: boolean;
  deviceToken: string | null;
  deviceJwt: string | null;
  lastLoginTime: number;
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  deviceToken: null,
  deviceJwt: null,
  lastLoginTime: 0
}; 