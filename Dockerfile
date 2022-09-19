# Builder image
FROM node:18 as builder

WORKDIR /usr/src/app

COPY yarn.lock tsconfig.json package*.json *.yml ./
COPY src ./src

RUN yarn install && yarn build

# Install dependencies

FROM node:18-alpine	as deps

WORKDIR /deps
COPY package.json .
COPY yarn.lock .
RUN yarn install --production --ignore-optional


# Create minimal production image from builder.
FROM node:18-alpine
WORKDIR /usr/src/app

EXPOSE 80
ENV NODE_ENV=production
ENV PORT=80

# COPY --from=builder --chown=node:node /usr/src/app/package*.json /usr/src/app/yarn.lock ./

COPY --from=deps --chown=node:node /deps/node_modules /usr/src/app/node_modules/
COPY --from=deps --chown=node:node /deps/package.json /usr/src/package.json
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/gdi-auth.openapi.yml /usr/src/app/gdi-auth.openapi.yml

# RUN yarn install --production=true && yarn global add pm2

# RUN yarn global add pm2
# RUN yarn cache clean
USER node

CMD ["node", "dist/index.js"]