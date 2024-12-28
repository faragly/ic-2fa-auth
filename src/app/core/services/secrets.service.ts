import { inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActorSubclass } from '@dfinity/agent';
import { connect } from 'ngxtension/connect';
import { from, interval, Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import {
  concatWith,
  endWith,
  finalize,
  map,
  mergeWith,
  connect as rxConnect,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { match, P } from 'ts-pattern';
import { AUTH_SERVICE } from '@core/tokens';
import { createActor } from '@core/utils';
import { idlFactory } from '@declarations/ic-2fa-auth-backend';
import {
  _SERVICE as BackendActor,
  ID,
  Secret,
  SecretCreate,
  SecretUpdate,
} from '@declarations/ic-2fa-auth-backend/ic-2fa-auth-backend.did';

export type ExtractObservable<P> = P extends Observable<infer T> ? T : never;

interface State {
  actor: ActorSubclass<BackendActor> | null;
  data: Secret[];
  loading: Record<'create' | 'list', boolean> & Record<'delete' | 'update', ID[]>;
  now: number;
}

const INITIAL_VALUE: State = {
  actor: null,
  data: [],
  loading: {
    create: false,
    list: false,
    delete: [],
    update: [],
  },
  now: Date.now(),
};

@Injectable({
  providedIn: 'root',
})
export class SecretsService {
  #authService = inject(AUTH_SERVICE);
  // #create = new Subject<SecretCreate>();
  #refresh = new Subject<void>();
  #state = signal(INITIAL_VALUE);
  actor$ = toObservable(this.#authService.identity).pipe(
    switchMap((identity) =>
      createActor<BackendActor>({
        canisterId: import.meta.env.CANISTER_ID_IC_2FA_AUTH_BACKEND,
        identity,
        host: import.meta.env.DFX_NETWORK === 'local' ? 'http:/localhost:4943' : 'https://icp-api.io',
        idlFactory,
      }),
    ),
    shareReplay(1),
  );
  state = this.#state.asReadonly();

  constructor() {
    connect(this.#state, this.actor$, (state, actor) => ({ ...state, actor }));
    this.#initListObserving();
    connect(this.#state, interval(1000).pipe(map(() => ({ now: Date.now() }))));
  }

  #initListObserving() {
    const list$ = this.actor$.pipe(
      rxConnect((shared) => shared.pipe(mergeWith(this.#refresh.asObservable().pipe(switchMap(() => shared)))), {
        connector: () => new ReplaySubject(1),
      }),
      switchMap((actor) => of({ loading: true }).pipe(concatWith(from(actor.list())), endWith({ loading: false }))),
    );

    const stateReducer = (state: State, value: ExtractObservable<typeof list$>) =>
      match(value)
        .with({ loading: P.boolean.select() }, (loading) => ({
          ...state,
          loading: { ...state.loading, list: loading },
        }))
        .otherwise((data) => ({ ...state, data }));

    connect(this.#state, list$, stateReducer);
  }

  create(payload: SecretCreate) {
    this.#state.update((state) => ({ ...state, loading: { ...state.loading, create: true } }));
    return this.actor$.pipe(
      switchMap((actor) => actor.create(payload)),
      switchMap((result) =>
        match(result)
          .with({ err: { alreadyExists: P.select() } }, (id) =>
            throwError(() => new Error(`The secret already exists. ID ${id}`)),
          )
          .otherwise(({ ok }) => of(ok)),
      ),
      finalize(() => this.#state.update((state) => ({ ...state, loading: { ...state.loading, create: false } }))),
    );
  }

  delete(id: ID) {
    this.#state.update((state) => ({
      ...state,
      loading: { ...state.loading, delete: [...state.loading.delete, id] },
    }));
    return this.actor$.pipe(
      switchMap((actor) => actor.delete(id)),
      switchMap((result) =>
        match(result)
          .with({ err: { notFound: P.nullish } }, () =>
            throwError(() => new Error(`The secret with ID ${id} not found.`)),
          )
          .otherwise(({ ok }) => of(ok)),
      ),
      finalize(() =>
        this.#state.update((state) => ({
          ...state,
          loading: { ...state.loading, delete: state.loading.delete.filter((_id) => _id !== id) },
        })),
      ),
    );
  }

  refresh() {
    this.#refresh.next();
  }

  update(payload: SecretUpdate) {
    this.#state.update((state) => ({
      ...state,
      loading: { ...state.loading, update: [...state.loading.update, payload.id] },
    }));
    return this.actor$.pipe(
      switchMap((actor) => actor.update(payload)),
      switchMap((result) =>
        match(result)
          .with({ err: { notFound: P.nullish } }, () =>
            throwError(() => new Error(`The secret with ID ${payload.id} not found.`)),
          )
          .otherwise(({ ok }) => of(ok)),
      ),
      finalize(() =>
        this.#state.update((state) => ({
          ...state,
          loading: { ...state.loading, update: state.loading.update.filter((id) => id !== payload.id) },
        })),
      ),
    );
  }
}
