. $HOME/.local/share/dfx/env

# import identity
dfx identity import --storage-mode=plaintext $DFX_DEV_IDENTITY ./identity/$DFX_DEV_IDENTITY/identity.pem -q
dfx identity use $DFX_DEV_IDENTITY -q

# start replica
dfx start --clean &> /app/replica.log

# pull and setup internet identity canister in local
dfx deps pull
dfx deps init --argument '(null)' internet-identity

# install dependencies
npm ci --no-audit
mops install

# deploy canisters in local
dfx deps deploy
dfx deploy ic-2fa-auth-frontend
dfx deploy ic-2fa-auth-backend

# generate declarations
dfx generate

# keep waiting
tail -f /app/replica.log
