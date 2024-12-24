import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ID = string;
export type ID__1 = string;
export type Result = { 'ok' : null } |
  { 'err' : { 'notFound' : null } };
export type Result_1 = { 'ok' : null } |
  { 'err' : { 'alreadyExists' : ID__1 } };
export interface Secret {
  'id' : ID,
  'otpType' : { 'hotp' : null } |
    { 'totp' : null },
  'name' : string,
  'createdAt' : Time,
  'secretKey' : string,
  'updatedAt' : Time,
}
export interface SecretCreate {
  'otpType' : { 'hotp' : null } |
    { 'totp' : null },
  'name' : string,
  'secretKey' : string,
}
export interface SecretUpdate {
  'id' : ID,
  'otpType' : { 'hotp' : null } |
    { 'totp' : null },
  'name' : string,
  'secretKey' : string,
}
export type Time = bigint;
export interface _SERVICE {
  'create' : ActorMethod<[SecretCreate], Result_1>,
  'delete' : ActorMethod<[ID__1], Result>,
  'list' : ActorMethod<[], Array<Secret>>,
  'update' : ActorMethod<[SecretUpdate], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
