export const environment = {
    production: true,
    // authUrl: `https://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.ic0.app/auth-delegation`,
    authUrl: `http://${import.meta.env.CANISTER_ID_IC_2FA_AUTH_FRONTEND}.localhost:8080/auth-delegation`,
    envName: 'PROD',
    scheme: 'ic-2fa-auth',
    // Point to icp-api for the mainnet. Leaving host undefined will work for localhost
    httpAgentHost: 'https://icp-api.io'
};
