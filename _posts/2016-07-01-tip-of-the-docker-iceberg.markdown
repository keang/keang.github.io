---
layout: post
title: "Tip of the docker iceberg"
date: 2016-07-01 23:28:00 +0800
category: stack
comments: true
---
Docker is gaining some popularity in recent months. While
I am not advocating any bandwagon jumpings, the following Google Search Trend
graph highly suggests that Docker has been solving many people's problems:
[![Docker vs Rails](/images/docker-vs-rails.png)][search_trend]
[_Docker vs Rails Google search trends_][search_trend]

Here I attempt to write up a short intro to docker, and how you can use it
in your development environment.

What is Docker
-----

[Docker.com](https://www.docker.com/what-docker) defines itself as:

> Docker containers wrap a piece of software
> in a complete filesystem that contains
> everything needed to run: code, runtime,
> system tools, system libraries – anything
> that can be installed on a server. This
> guarantees that the software will always run
> the same, regardless of its environment.

That's pretty plain English, but also pretty high level, and [people still have disagreements][commit_strip].

To me the most important things remember about Docker, so that it serves to help you in your dev env
is the following:
- It's designed to contain your app/process/service.
- You can create containers from images.
- Images can be pulled from registries or built with their configuration declarations.
- Containers are spawned to do the work/service.

Basic operations
------

As an example, I'll run a dockerized mongodb. Below is an example command flow.

I list the available images:

```
$ docker images
REPOSITORY    TAG     IMAGE ID       CREATED        SIZE
postgres      latest  247a11721cbd   5 weeks ago    265.9 MB
mysql         latest  e583afc2f0e4   6 weeks ago    378.4 MB
mysql         5.6     ad517d403791   6 weeks ago    329 MB
redis         latest  be9c5a746699   7 weeks ago    184.9 MB
mongo         latest  a55d8a328b43   8 weeks ago    313.1 MB
```

I start a new container from the mongo image:

```
$ docker run -d mongo
724fc23032ae9855790e665e92e8891f018181f8ec707c763ccb2c12a7479332
```

I can check that the port `27017` is being served mongodb:

```
$ docker ps
CONTAINER ID   IMAGE     COMMAND                  CREATED      STATUS        PORTS                      NAMES
724fc23032ae   mongo     "/entrypoint.sh mongo"   5 weks ago  Up 2 seconds   0.0.0.0:27017->27017/tcp   sleepy_spence
```

And now I just proceed to tell my application to connect to `localhost:27017` as per normal.
If I need to see the mongodb logs, to check out what is being queried, for example, I can:

```
$ docker logs sleepy_spence
```

Normally I would let it run in the background. If, however, I decide that I need to shut mongo down
(it's using up memory afterall), I can:

```
$ docker stop sleepy_spence
```

The great thing here is that I now have a set up flow for... almost any service that I need to set up on my dev machine.
As you saw in the example, I have mysql, postgres and redis dockerized. The time and effort saved here means you'll be
able to quickly get down to pushing that hotfix from your brother's windows machine during your family retreat (true story).


Setting up a container
------

Whatever you thought of, there's probably already an ~~app~~ image for that.
So the first step is to find that image from the public registry.

Analogous to how [github.com](http://www.github.com) hosts `git` repos, [Docker Hub](https://hub.docker.com) hosts
docker images. With an account you can create public and images of your own. But today we'll just pull from the offical
account, which collects most of the things we need to speed up our dev set up. The setting up of private and custom
images are left as an exercise for the reader.

[Go here](https://hub.docker.com/explore) to explore, or as I prefer, just google "\<what-you-need\> docker".

We find the [mysql docker image here](https://hub.docker.com/_/mysql/), from which we can see that, as of 01 July 2016, versions 5.5 to 5.7
are available for us to pull and use.

Most images comes with some minimal configurations, like env var, ports, file volume linking, etc. We can use [docker-compose](https://docs.docker.com/compose/)
to alleviate our task of remembering the rather long commands, which is a certainty if we configure everything inline.

I create a `docker-compose.yml` file like so:

```yml
# ./docker-compose.yml
mysql:
  image: mysql:5.6
  ports:
    - "3306:3306"
  volumes:
    - "/home/keang/data/mysql:/var/lib/mysql"
  environment:
    MYSQL_ROOT_PASSWORD: 'password'
```

And from this I can invoke the new basic operations:

Basic operations 2.0
----

```
$ docker-compose up -d mysql
$ docker-compose logs --tail=20 [-f] mysql
$ docker-compose stop mysql
```

`docker-compose` is really powerful because it lets us declare container linkings and share `.env`, etc. The
declarative style makes it easy to orchestrate multiple services accross different environments too, for example testing,
staging, and even production. For example, I can have the following declaration that spins up new instances of
worker, database, cache store, all done at the Continuous Integration service, thanks to docker-compose.

```yml
# ./docker-compose.test.yml
testpages:
  build: .
  dockerfile: ./Dockerfile_test_pages
  env_file: test.env
  volumes:
    - ./:/app
  links:
    - postgres
    - redis
    - mongo
postgres:
  image: postgres
  ports:
    - "5434:5432"
  environment:
   - POSTGRES_PASSWORD=password

mongo:
  image: mongo

redis:
  image: redis
```

Recap
-----

This post aims to plant a seed of interest in docker, by showing how it can help with the set up of dev environment
quickly, and also a small glimpse at how it can help manage services configurations in a declarative (and hence version-controllable) way.

As the title of this post suggest, this is only the tip of the iceberg; there are many more things that is not covered,
and I believe it is worthwhile to get aquainted with this handy software. I definitely learned a lot of things, even
besides docker itself, after trying it out. I'm sure it'll be the same for many.

Happy dockering!

[search_trend]: https://www.google.com.sg/trends/explore#q=%2Fm%2F0wkcjgj%2C%20%2Fm%2F0505cl&cmpt=q&tz=Etc%2FGMT-8
[commit_strip]: http://www.commitstrip.com/en/2016/06/24/how-to-host-a-coder-dinner-party/

