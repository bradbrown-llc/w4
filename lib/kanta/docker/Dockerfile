FROM denoland/deno:alpine-1.43.1
RUN apk --update add git tar
WORKDIR /w4
COPY . .
WORKDIR /w4/lib/kanta/docker
RUN deno cache serve.ts
CMD deno run -A serve.ts