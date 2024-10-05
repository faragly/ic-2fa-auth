import { AnonymousIdentity, Identity } from '@dfinity/agent';

export function isIdentityEqual(a: Identity, b: Identity) {
  return a.getPrincipal().compareTo(b.getPrincipal()) === 'eq';
}

export function isAnonymousIdentity(
  identity: Identity
): identity is AnonymousIdentity {
  return identity.getPrincipal().isAnonymous();
}
