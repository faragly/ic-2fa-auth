interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Readonly<ImportMetaEnv> {
  CANISTER_ID_IC_2FA_AUTH_BACKEND: string;
  CANISTER_ID_IC_2FA_AUTH_FRONTEND: string;
  CANISTER_ID_INTERNET_IDENTITY: string;
  DFX_NETWORK: string;
  DFX_VERSION: string;
}
