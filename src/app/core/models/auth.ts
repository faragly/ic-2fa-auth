import { Signal } from '@angular/core';
import { Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

export interface IAuthService {
  identity: Signal<Identity>;
  isAuthenticated: Signal<boolean>;
  principalId: Signal<string>;
  signIn(): Promise<void> | void;
  signOut(): Promise<void> | void;
}

export type AuthClientInstance = Awaited<ReturnType<typeof AuthClient.create>>;
export type AuthClientLogoutOptions = Parameters<AuthClientInstance['logout']>[0];
