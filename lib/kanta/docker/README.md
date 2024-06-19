run the following command from the w4 folder to build the kanta image:
```
docker build -t w4-kanta -f lib/kanta/docker/Dockerfile .
```

if that works, you should now be able to run the following command to run the kanta server:
(add -d to run detached and return the container id, add --rm to remove the container filesystem after it exits)

```
docker run w4-kanta
```