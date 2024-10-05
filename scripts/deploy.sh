#!/usr/bin/env bash

# npm install
# npm ci

# pull and setup internet identity canister in local
dfx deps pull
dfx deps init --argument '(null)' internet-identity

# deploy canisters in local
dfx deps deploy
dfx deploy ic-2fa-auth-frontend
dfx deploy ic-2fa-auth-backend