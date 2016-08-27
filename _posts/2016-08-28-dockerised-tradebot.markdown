---
layout: post
title: "Dockerised Tradebot"
date: 2016-08-28 01:06:00 +0800
category: trade
comments: true
---

After some tweaks and cleanups, I've decided to share the code to a couple of friends as they expressed interests to have a bot trade for them too.

To make things easire, I've dockerised the trading project, pushing the python2.7 image with dependencies installed, batteries included, to [Docker Hub](https://hub.docker.com/r/kakadadroid/python27-talib/)

This was in the hope that it'll be a one-liner when people run the code, after the one-time docker installation and git pull. And it'll work everywhere! Linux, Mac, Windows, what have you.

Almost true.

Windows 7 32 bit isn't supported. But I'll share how it organised the docker configs here.

The following is roughly the plan:

![ec2-docker infrastructure](/images/docker.svg){: .center-image }

First I use docker-compose to delare all the images:


```
# docker-compose.yml
project-test:
  build: .
  dockerfile: Dockerfile.test
  env_file: test.env
  volumes:
    - ./:/usr/src/app

project-live:
  build: .
  dockerfile: Dockerfile.live
  env_file: live.env
  volumes:
   - ./:/usr/src/app
```

I have a pre-built image [hosted for free on Docker Hub](https://hub.docker.com/r/kakadadroid/python27-talib/) which builds on [Python:2.7](https://hub.docker.com/_/python/), installs [TA-lib](http://ta-lib.org/)
and other smaller dependencies for the project.

Then DOckerfile.live and Dockerfile.test are identical, pulling from the pre-built image, and appending different commands.

With the docker image successfully downloaded, the command to run becomes can now be a one-liner: `docker-compose run project-live`

Now how make this work on Windows 7... :fliptable:

