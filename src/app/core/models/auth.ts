import { Signal } from '@angular/core';
import { Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Observable } from 'rxjs';

export type AuthClientInstance = Awaited<ReturnType<typeof AuthClient.create>>;

export type AuthClientLogoutOptions = Parameters<
  AuthClientInstance['logout']
>[0];
export interface IAuthService {
  identity: Signal<Identity>;
  isAuthenticated: Signal<boolean>;
  principalId: Signal<string>;
  ready$: Observable<boolean>;
  signIn(): Promise<void> | void;
  signOut(): Promise<void> | void;
}
