import { SignIdentity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { PartialIdentity } from '@dfinity/identity';

export async function createAuthClient(
  identity?: SignIdentity | PartialIdentity
): Promise<AuthClient> {
  return await AuthClient.create({
    identity,
    // Idle checks aren't needed
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
    // noop storage
    storage: {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve(),
      remove: () => Promise.resolve(),
    },
  });
}
