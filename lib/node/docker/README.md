run the following command from the w4 folder to build the node image:
```
docker build -t w4-node -f lib/node/docker/Dockerfile .
```

if that works, you should now be able to run the following command to run an ethereum node:
(add -d to run detached and return the container id, add --rm to remove the container filesystem after it exits)

```
docker run w4-node
```