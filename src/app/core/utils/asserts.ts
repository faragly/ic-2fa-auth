import { AuthClient } from '@dfinity/auth-client';

export function assertClient(client: AuthClient | null): asserts client is AuthClient {
  if (!client) throw Error('The AuthClient instance is not initialized');
}
