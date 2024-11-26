export const environment = {
  // identityProviderUrl: `http://${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`,
  authUrl: `http://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.localhost:4943/auth-delegation`,
  envName: 'DEV',
  production: false,
  scheme: 'ic-2fa-auth',
};
