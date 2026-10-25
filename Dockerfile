# syntax=docker/dockerfile:1

FROM node:24.22.1-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS build
COPY package.json yarn.lock ./
RUN corepack enable
RUN yarn install --immutable
COPY . .

ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT=local
ARG NEXT_PUBLIC_SENTRY_RELEASE=none
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT} \
    NEXT_PUBLIC_SENTRY_RELEASE=${NEXT_PUBLIC_SENTRY_RELEASE}

RUN yarn lint && yarn typecheck && yarn test
# The upload token exists only for this command, never in an image layer or runtime ENV.
RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN SENTRY_DISABLED=1 yarn build

FROM base AS runner
ENV NODE_ENV=production
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT=local
ARG NEXT_PUBLIC_SENTRY_RELEASE=none
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT} \
    NEXT_PUBLIC_SENTRY_RELEASE=${NEXT_PUBLIC_SENTRY_RELEASE}

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/package.json /app/yarn.lock /app/next.config.mjs ./
USER node
EXPOSE 3000
CMD ["yarn", "start"]
