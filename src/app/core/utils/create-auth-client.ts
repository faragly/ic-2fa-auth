import { AuthClient, AuthClientCreateOptions } from '@dfinity/auth-client';

import { TauriStorage } from './tauri-storage';

export async function createAuthClient(): Promise<AuthClient> {
  const options: AuthClientCreateOptions = {
    // Idle checks aren't needed
    idleOptions: {
      disableDefaultIdleCallback: true,
      disableIdle: true,
    },
    keyType: 'Ed25519',
    storage: new TauriStorage(),
  };

  return await AuthClient.create(options);
}
