FROM public.ecr.aws/docker/library/node:26-alpine

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /var/task

ENV NODE_ENV=production \
    PORT=8080 \
    AWS_LWA_PORT=8080 \
    AWS_LWA_READINESS_CHECK_PATH=/api/health

COPY apps/api/server.mjs ./server.mjs
COPY apps/web/data/npb.sqlite ./data/npb.sqlite

USER node

CMD ["node", "server.mjs"]
