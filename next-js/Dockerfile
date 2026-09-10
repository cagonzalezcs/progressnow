# Headless Next.js frontend — container image (openspec next-deployment
# § Standalone build and container image; design D11).
#
#   docker build -t progressnow-next \
#     --build-arg WP_API_BASE=https://cms.example.org/wp-json/progressnow/v1 \
#     --build-arg NEXT_PUBLIC_SITE_ORIGIN=https://www.example.org \
#     --build-arg NEXT_PUBLIC_BUILD_ID=$(git rev-parse --short HEAD) .
#   docker run -p 3000:3000 --env-file .env.production progressnow-next
#
# Build-time inputs: Next inlines NEXT_PUBLIC_* and serializes next.config.ts
# (image hosts, the theme static rewrite target) into the standalone server,
# so WP_API_BASE / WP_ORIGIN / IMAGE_HOSTS / NEXT_PUBLIC_SITE_ORIGIN must be
# given at build time AND at run time (same values). The rest of the env
# contract (CHAPTER_REBUILD_SECRET, WP_BUILD_STATUS_URL, CSP_REPORT_ONLY…) is
# runtime-only; lib/env.ts fails the start when it is incomplete.

# --- deps ---------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: no dependency here needs a lifecycle script (the CI build
# proves it); a compromised postinstall cannot run inside the image build.
RUN npm ci --ignore-scripts --no-audit --no-fund

# --- build --------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG WP_API_BASE
ARG WP_ORIGIN
ARG IMAGE_HOSTS
ARG NEXT_PUBLIC_SITE_ORIGIN
ARG NEXT_PUBLIC_BUILD_ID
ENV WP_API_BASE=$WP_API_BASE \
    WP_ORIGIN=$WP_ORIGIN \
    IMAGE_HOSTS=$IMAGE_HOSTS \
    NEXT_PUBLIC_SITE_ORIGIN=$NEXT_PUBLIC_SITE_ORIGIN \
    NEXT_PUBLIC_BUILD_ID=$NEXT_PUBLIC_BUILD_ID \
    # The prerender pass validates the whole env contract (lib/env.ts) although the
    # build contacts nothing. Build-stage only: not copied into the runner, where
    # instrumentation.ts insists on the real secret at start.
    CHAPTER_REBUILD_SECRET=build-stage-placeholder-not-a-secret
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The theme's fixtures/static are outside this context; the build needs neither
# (routes render per request, fonts proxy to WP_ORIGIN at run time).
RUN npm run build

# --- runner -------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S -G app app
# output: 'standalone' — the traced server + the exact node_modules it needs.
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
USER app
EXPOSE 3000
# Liveness on the same endpoint scripts/smoke.mjs and load balancers use; never touches WordPress.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" || exit 1
CMD ["node", "server.js"]
