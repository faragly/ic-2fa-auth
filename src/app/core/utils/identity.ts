import { AnonymousIdentity, Identity } from '@dfinity/agent';

export function isAnonymousIdentity(
  identity: Identity,
): identity is AnonymousIdentity {
  return identity.getPrincipal().isAnonymous();
}

export function isIdentityEqual(a: Identity, b: Identity) {
  return a.getPrincipal().compareTo(b.getPrincipal()) === 'eq';
}
