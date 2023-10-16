FROM node:16.13-stretch-slim as build
ARG SENTRY_AUTH_TOKEN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG NEXT_PUBLIC_SENTRY_RELEASE
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT ${NEXT_PUBLIC_SENTRY_ENVIRONMENT}
ENV NEXT_PUBLIC_SENTRY_RELEASE ${NEXT_PUBLIC_SENTRY_RELEASE}
WORKDIR /app
RUN echo "deb http://archive.debian.org/debian/ stretch main" > /etc/apt/sources.list \
    && echo "deb http://archive.debian.org/debian-security stretch/updates main" >> /etc/apt/sources.list \
    && apt update && apt install -y ca-certificates
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY *.ts ./
COPY *.js ./
COPY *.json ./
COPY src/ ./src/
COPY public/ ./public/
RUN pwd 1>&2
RUN ls ./ 1>&2
RUN ls /app 1>&2
RUN yarn build

FROM node:16.13-stretch-slim as runner
ARG SENTRY_AUTH_TOKEN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG NEXT_PUBLIC_SENTRY_RELEASE
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT ${NEXT_PUBLIC_SENTRY_ENVIRONMENT}
ENV NEXT_PUBLIC_SENTRY_RELEASE ${NEXT_PUBLIC_SENTRY_RELEASE}
WORKDIR /app
RUN echo "deb http://archive.debian.org/debian/ stretch main" > /etc/apt/sources.list \
    && echo "deb http://archive.debian.org/debian-security stretch/updates main" >> /etc/apt/sources.list \
    && apt update && apt install -y ca-certificates
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY package.json ./
COPY --from=build /app/yarn.lock ./
COPY public/ ./public/
EXPOSE 3000
CMD ["yarn", "start"]
