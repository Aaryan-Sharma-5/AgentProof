# Shared image for the two Node services. The start command selects which one runs:
#   agent service (SOLE ECONOMIC SIGNER):  npx tsx service.ts
#   HTTP 402 provider (no keys):           npx tsx provider/server.ts

FROM node:20-slim

WORKDIR /app

# Deterministic install from the lockfile. tsx is a devDependency but is the runtime here (the
# services are executed directly as TypeScript), so it is installed explicitly at the version the
# lockfile pins. The TypeScript compiler itself is NOT needed at runtime - tsx transpiles without
# type-checking, and `npm run typecheck` runs in CI, not in the image.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install --no-save tsx@^4.23.13

COPY . .

# Local development defaults. On Render, PORT is injected and takes precedence (see service.ts
# and provider/server.ts, which read PORT first). No secret is ever baked into this image; the
# signer keys are supplied at runtime and only to the agent service.
ENV AGENT_SERVICE_PORT=4100 \
    PROVIDER_PORT=4000 \
    NODE_ENV=production

# Overridden per service by render.yaml's dockerCommand.
CMD ["npx", "tsx", "service.ts"]
