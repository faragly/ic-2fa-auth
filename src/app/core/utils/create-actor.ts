import { isDevMode } from '@angular/core';
import { Actor, ActorSubclass, Identity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { createAgent } from '@dfinity/utils';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function createActor<T>({
  identity,
  canisterId,
  idlFactory,
  host,
}: {
  canisterId: Principal | string;
  host?: string;
  identity: Identity;
  idlFactory: IDL.InterfaceFactory;
}): Observable<ActorSubclass<T>> {
  return from(createAgent({ identity, fetchRootKey: isDevMode(), host })).pipe(
    map((agent) =>
      Actor.createActor<T>(idlFactory, {
        agent,
        canisterId,
      }),
    ),
  );
}
