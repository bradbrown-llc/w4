FROM denoland/deno:alpine-1.43.1
WORKDIR /w4
COPY . .
WORKDIR /w4/tests/w4-node-simple
RUN deno cache test.ts