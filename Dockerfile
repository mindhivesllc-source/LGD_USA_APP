FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache openssl
EXPOSE 3000
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
RUN npm remove @shopify/cli
COPY --from=builder /app/build ./build
COPY . .
RUN mkdir -p /app/db
CMD ["npm", "run", "docker-start"]
