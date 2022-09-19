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
```
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

Navigate to [http://localhost:3000/auth/login?redirectUrl=http://localhost:3000/fake-login-callback](http://localhost:3000/auth/login?redirectUrl=http://localhost:3000/fake-login-callback)
