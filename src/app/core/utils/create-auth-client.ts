import { SignIdentity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { PartialIdentity } from '@dfinity/identity';

export async function createAuthClient(identity?: PartialIdentity | SignIdentity): Promise<AuthClient> {
  return await AuthClient.create({
    identity,
    // Idle checks aren't needed
    idleOptions: {
      disableDefaultIdleCallback: true,
      disableIdle: true,
    },
    // noop storage
    storage: {
      get: () => Promise.resolve(null),
      remove: () => Promise.resolve(),
      set: () => Promise.resolve(),
    },
  });
}
