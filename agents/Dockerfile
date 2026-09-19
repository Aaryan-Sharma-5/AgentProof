# Canonical agent service AND provider share this image; the start command selects which runs.
FROM node:20-slim

WORKDIR /app

# Install dependencies first so they cache independently of source changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install tsx typescript --no-save

COPY . .

# Overridden per service by fly.toml / docker run.
ENV AGENT_SERVICE_PORT=4100
ENV PROVIDER_PORT=4000

CMD ["npx", "tsx", "service.ts"]
