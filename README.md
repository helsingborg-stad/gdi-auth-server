# GDI Auth Server

Authentication using APIs from Visma.
# Getting started

## Create environment
```sh
# Consult your local keymaster for secrets and credentials regarding Visma
touch .env
echo "VISMA_AUTH_CUSTOMERKEY=..." >> .env
echo "VISMA_AUTH_SERVICEKEY=..." >> .env
echo "VISMA_AUTH_BASEURL=..." >> .env
# Set shared secret used to sign JWT
# This key should be distributed to all federates that wish to verify an issued access token
echo "JWT_SHARED_SECRET=<tell this to other services that wish to perform authorization" >> .env
# Set a private signing secret that should never be known outside the running service
echo "JWT_PRIVATE_SECRET=<set once and NEVER tell>" >> .env
# Optionally set claims used in tokens
echo "JWT_SIGN_ISSUER=https://www.example.com" >> .env
echo "JWT_SIGN_AUDIENCE=https://example.com" >> .env
echo "JWT_SIGN_EXPIRES_IN=12h" >>.env
echo "JWT_SIGN_NOT_BEFORE=0s" >> .env
```

Note that __JWT_SIGN_EXPIRES_IN__ and __JWT_SIGN_NOT_BEFORE__ uses formats recognized by https://github.com/vercel/ms#readme.
## Setup dependencies
```sh
yarn install
```
## Run web server

```sh
# i-dont-care-mode
yarn start

# i-want-some-fancy-debug-output
DEBUG=* yarn start

# i-want-to-use-another-port
port=8080 yarn start
```

## Local testing?

Navigate to http://localhost:3000/api/v1/auth/login?redirect_url=http://localhost:3000/api/v1/auth/test-landing-page

## Linting

This project uses [ESLint](https://eslint.org/) for linting and formatting, with in-editor support for VSCode provided by the [microsoft/ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension.