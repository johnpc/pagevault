# PageVault's self-hosted backend: PocketBase (auth + SQLite + REST + realtime +
# file storage) in a single ~15MB static binary. PocketBase publishes no official
# image, so we fetch a PINNED release into a minimal Alpine image — reproducible
# and offline-cacheable. Bump PB_VERSION deliberately (schema migrations in
# pb_migrations/ replay against the new binary on boot).
FROM alpine:3.20

ARG PB_VERSION=0.39.6
ARG TARGETARCH=amd64

RUN apk add --no-cache ca-certificates unzip wget \
  && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" -O /tmp/pb.zip \
  && unzip /tmp/pb.zip -d /pb \
  && rm /tmp/pb.zip

EXPOSE 8090

# pb_migrations = our version-controlled schema (auto-applied on boot).
# pb_hooks     = optional server-side JS hooks. Both are bind-mounted read-only
# in docker-compose so edits in the repo take effect on restart.
ENTRYPOINT ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", \
  "--dir=/pb_data", "--migrationsDir=/pb_migrations", "--hooksDir=/pb_hooks"]
