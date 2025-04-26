export const environment = {
  identityProviderUrl: 'https://identity.ic0.app',
  appUrl: `https://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.icp0.io`,
  appName: 'IC 2FA Auth',
  envName: 'PROD',
  // Point to icp-api for the mainnet. Leaving host undefined will work for localhost
  httpAgentHost: 'https://icp-api.io',
  production: true,
  scheme: 'ic-2fa-auth',
  backendCanisterId: import.meta.env.CANISTER_ID_IC_2FA_AUTH_BACKEND,
};
