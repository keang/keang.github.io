---
layout: post
title:  "Hello, PostGraphile"
date:   2018-08-25 10:55:13 +1000
categories: hack
comments: true
---
I built a small GraphQL server using a rather simple backend stack: Postgresql and Postgraphile. It turns out to be quite good for building quick prototypes/MVP.

# Context

At work, we started using [GraphQL Ruby](http://graphql-ruby.org/) to implement [GraphQL](https://graphql.org/) for our new API. We do this on top of a Rails application. We did it with Rails 5 first,
then backport it to a Rails 3.2 app, with surprisingly few setbacks, but that's for discussion in a different post. At present the backend consist of: Graphql-Ruby + Rails + Postgresql.

After being aquainted with GraphQL, you will notice that GraphQL queries and mutations are a strong analogy to database commands. They either query for data or mutate the data. So between the HTTP Api layer and
and our Postgresql database, we have this fat and ugly monstrosity called Rails; with the often-forgotten feature-richness of Postgresql, I wonder how much of the middleman can be removed.
Less code means less bugs, right?

# The discovery

For our existing backend, Rails handles a few things as usual:
1. authentication,
1. authorization,
1. some business logic,
1. a few background workers to send emails and mobile notifications
1. handles incoming webhooks from third party services, like our calendar scheduling, email replies, etc.

I found [PostGraphile](https://www.graphile.org/postgraphile/), claiming to be "Instant GraphQL API for PostgreSQL database". The documentation outlines how authentication can be achieved using JWT and
stored procedures(functions); [authorization can be achieved](https://www.graphile.org/postgraphile/postgresql-schema-design/#row-level-security) with Postgres 9.5's Row Level Security. Right off the bat
this looks promising.
The plan is we'll do business logic in postgresql functions.

# Quick hack

I put together a prototype GraphQL API [here](https://gitlab.com/keang/invo), which is an inventory management system of sorts. I went with PostGraphile's command line interface, rather than as a middleware
to some Node.js frameworks, because, see #Context.

While it is an entirely new tech stack, most of the time was spent designing the table and the relationship, and access control roles.

A delightful observation: the server code basically consists of just one `schema.sql`. And a generated `api.graphql`.
Some migrations and seeding is there for maintainability and local development and test.

It immediately puts the focus on designing domain models, which is the core of businesses most of the time.
This focus on business models defers the lock-in to one web app framework, and allows the engineer to focus on the real architecture of the
app as alluded to by [this talk on The Principles of Clean Architecture by Uncle Bob.](https://www.youtube.com/watch?v=o_TH-Y78tt4)

# Drawbacks

- JWT based authentication system, or stateless authentication system has its own drawbacks and criticisms. When using the traditional full-fledged web app frameworks like Rails, more options are available.
- The app is not able to support webhooks directly, so we'll have to add (and maintain) some other way to expose that webhook or forward that from some serverless functions, for example.
- Sending out http calls in the background (like triggering mobile notifications) would be hairy when done entirely with postgresql alone, so again, maybe we'll have to maintain some serverless functions that listens to postgresql's NOTIFY
- Someone still need to maintain html emails. We won't be able to squeeze that into postgresql.

# Verdict

Although I have not deployed the app and see it working in production, it was rather painless experience jumping into PostGraphile. I'll definitely be using this (or something similar) for my next prototype/MVP.
