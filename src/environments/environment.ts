export const environment = {
  authUrl: `http://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.localhost:8080/auth-delegation`,
  // authUrl: `http://localhost:1420/auth-delegation`,
  envName: 'DEV',
  production: false,
  scheme: 'ic-2fa-auth',
};
