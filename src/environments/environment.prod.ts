export const environment = {
  // authUrl: `https://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.ic0.app/auth-delegation`,
  // authUrl: `http://${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`,
  // identityProviderUrl: 'https://identity.ic0.app',
  authUrl: `http://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.ic0.app/auth-delegation`,
  appName: 'IC 2FA Auth',
  envName: 'PROD',
  // Point to icp-api for the mainnet. Leaving host undefined will work for localhost
  httpAgentHost: 'https://icp-api.io',
  production: true,
  scheme: 'ic-2fa-auth',
};
