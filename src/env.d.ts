interface ImportMeta {
    readonly env: ImportMetaEnv;
}
  
interface Readonly<ImportMetaEnv> {
    DFX_VERSION: string;
    DFX_NETWORK: string;
    CANISTER_ID_INTERNET_IDENTITY: string;
    CANISTER_ID_IC_2FA_AUTH_FRONTEND: string;
    CANISTER_ID_IC_2FA_AUTH_BACKEND: string;
}
