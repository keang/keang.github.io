AWS: My ops clinic
==
Oct 14 2015 11:48PM

[deepo](http://www.deepo.io/) is upgrading our infrastructure yet again.

And in the past 2 weeks, I had sort of a clinic for operations work, AWS guided. And acronyms infested.

I've come to see the "ephemerality" of EC2 instances (even the ones with EBS backed storage). This view helped quite a bit when I accidently Terminated an instance, when I was only trying to Stop it. (Yes I clicked confirm. I should keep in mind that dialog boxes are important, more often than not.)

I have also found a new level of appreciation for docker -actually, docker-compose- and its recipe over material approach. What I have been doing with real ec2 boxes, docker-compose does with containers.

ELB + EC2 + Docker + Docker-compose. I can literally spin up a whole stack in 5 minutes!

Deepo now is moving on to Golang + Rabbitmq + Python worker + Cassandra + Postgres + Rails. Redis cache here and there.

Automate everything! That's another thing that's just earned new appreciations from another noob dev.
