import { Signal } from '@angular/core';
import { AuthClient } from '@dfinity/auth-client';

export interface IAuthService {
  principalId: Signal<string>;
  signIn(): Promise<void> | void;
  signOut(): Promise<void> | void;
  isAuthenticated: Signal<boolean>;
}

export type AuthClientInstance = Awaited<ReturnType<typeof AuthClient.create>>;
export type AuthClientLogoutOptions = Parameters<
  AuthClientInstance['logout']
>[0];
