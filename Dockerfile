# ===== Build stage =====
FROM node:20-alpine AS build
WORKDIR /usr/src/app

RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./


RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ===== Runtime stage =====
FROM node:20-alpine
WORKDIR /usr/src/app

RUN npm install -g serve
COPY --from=build /usr/src/app/build ./build

ENV PORT=3003
EXPOSE 3003


CMD sh -c 'echo "window.__APP_CONFIG__ = { API_BASE: \"${API_BASE}\" };" > ./build/config.js && serve -s build -l 3003'


#CMD ["serve", "-s", "build", "-l", "3003"]
