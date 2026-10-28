# syntax=docker/dockerfile:1

FROM node:24.22.1-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

ENV COREPACK_HOME=/usr/local/share/corepack
RUN corepack enable && corepack install -g yarn@4.18.1

FROM base AS build
COPY package.json yarn.lock .yarnrc.yml ./
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
# Yarn needs both its install state and node-modules linker configuration at runtime.
COPY --from=build --chown=node:node /app/.yarn ./.yarn
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/package.json /app/yarn.lock /app/.yarnrc.yml /app/next.config.mjs ./
USER node
EXPOSE 3000
CMD ["yarn", "start"]
