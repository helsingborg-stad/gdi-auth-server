# Builder image
FROM node:18 as builder

WORKDIR /usr/src/app

COPY yarn.lock tsconfig.json package*.json *.yml ./
COPY src ./src

RUN yarn install && yarn build



# Create minimal production image from builder.
FROM node:18-alpine
WORKDIR /usr/src/app

EXPOSE 80
ENV NODE_ENV=production
ENV PORT=80

COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/package*.json /usr/src/app/yarn.lock ./

RUN yarn install --production=true && yarn global add pm2
USER node

CMD ["pm2-runtime", "dist/index.js"]