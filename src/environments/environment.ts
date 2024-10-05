export const environment = {
    production: false,
    authUrl: `http://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.localhost:8080/auth-delegation`,
    // authUrl: `http://localhost:1420/auth-delegation`,
    envName: 'DEV',
    scheme: 'ic-2fa-auth'
};
