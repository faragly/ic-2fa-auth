export const environment = {
  identityProviderUrl: `https://${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}.localhost`,
  appUrl: `https://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.localhost`,
  appName: 'IC 2FA Auth',
  httpAgentHost: 'https://localhost',
  envName: 'DEV',
  production: false,
  scheme: 'ic-2fa-auth',
  backendCanisterId: import.meta.env.CANISTER_ID_IC_2FA_AUTH_BACKEND,
};
