FROM denoland/deno:alpine-1.43.1
RUN apk --update add git tar
WORKDIR /w4
COPY . .
WORKDIR /w4/node
RUN deno run -A prep.ts
ENTRYPOINT deno run -A serve.ts