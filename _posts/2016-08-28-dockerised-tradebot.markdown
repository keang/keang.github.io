---
layout: post
title: "Dockerised Tradebot"
date: 2016-08-28 01:06:00 +0800
category: trade
comments: true
---

After some tweaks and cleanups, I've decided to share the code to a couple of friends as they expressed interests to have a bot trade for them too.

To make things easire, I've dockerised the trading project, bundling a python2.7 image with dependencies installed, batteries included, to [Docker Hub](https://hub.docker.com/r/kakadadroid/python27-talib/)

This was in the hope that it'll be a one-liner when people run the code, after the one-time docker installation and git pull. And it'll work everywhere! Linux, Mac, Windows, what have you.

Almost true.

Windows 7 32 bit isn't supported. But I'll share how I organised the docker configs here.

The following is roughly the plan:

![ec2-docker infrastructure](/images/docker.svg){: .center-image }

First I use docker-compose to declare all the images:


```
# docker-compose.yml
test:
  build: .
  dockerfile: Dockerfile.test
  env_file: test.env
  volumes:
    - ./:/usr/src/app

live:
  build: .
  dockerfile: Dockerfile.live
  env_file: live.env
  volumes:
   - ./:/usr/src/app
```

I have a pre-built image [hosted for free on Docker Hub](https://hub.docker.com/r/kakadadroid/python27-talib/) which builds on [Python:2.7](https://hub.docker.com/_/python/), installs [TA-lib](http://ta-lib.org/)
and other smaller dependencies for the project.

Then Dockerfile.live and Dockerfile.test are identical, pulling from the pre-built image, and appending different commands:

```
# Dockerfile.test
FROM kakadadroid/python27-talib
MAINTAINER skeang@gmail.com

CMD py.test
```

```
# Dockerfile.live
FROM kakadadroid/python27-talib
MAINTAINER skeang@gmail.com

CMD python runner.py
```

With the docker image successfully downloaded, the command to trade looking at the current prices can now be a one-liner: `docker-compose run live`.

Similarly, it's a one liner to run all tests: `docker-compose run test`

Now, how make this work on Windows 7... :fliptable:

