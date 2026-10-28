# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY mobile/package*.json ./
RUN npm ci

# Dev: dependencies only; source bind-mounted at runtime.
FROM deps AS development

EXPOSE 3011
CMD ["npx", "expo", "start", "--web", "--port", "3011", "--host", "lan"]

FROM deps AS builder

WORKDIR /app
COPY mobile/ ./

ARG EXPO_PUBLIC_API_URL=https://jay-api.spotynet.com
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL \
    CI=1

RUN npx expo export --platform web

FROM nginx:1.27-alpine AS production

COPY docker/mobile/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3011

CMD ["nginx", "-g", "daemon off;"]
