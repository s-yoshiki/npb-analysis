# cdk-nextjs Lambda image customized for the project's Node.js 26 runtime.
FROM public.ecr.aws/docker/library/node:26-alpine AS runner

RUN apk add --no-cache libc6-compat

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

ARG RELATIVE_PATH_TO_PACKAGE

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs public ./$RELATIVE_PATH_TO_PACKAGE/public
COPY --chown=nextjs:nodejs data/npb.sqlite ./data/npb.sqlite

USER nextjs

EXPOSE 3000

ENV PORT=3000
