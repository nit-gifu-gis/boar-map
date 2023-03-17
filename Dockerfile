FROM node:16.13-stretch-slim as build
WORKDIR /app
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
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY package.json ./
COPY --from=build /app/yarn.lock ./
COPY public/ ./public/
EXPOSE 3000
CMD ["yarn", "start"]
