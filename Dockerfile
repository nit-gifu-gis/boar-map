FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

COPY . .
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile --prefer-offline
RUN pnpm build

CMD ["pnpm", "start"]
EXPOSE 3000
