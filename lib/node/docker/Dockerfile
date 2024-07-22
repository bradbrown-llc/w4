FROM denoland/deno:alpine-1.43.1
RUN apk --update add git tar
WORKDIR /w4
COPY . .
WORKDIR /w4/lib/node/docker
RUN \
    deno run -A prep.ts && \
    deno cache serve.ts
CMD deno run -A serve.ts