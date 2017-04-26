---
layout: post
title:  "Up your commit game: add a style-check hook"
date:   2017-04-27 02:38:00 +0800
categories: automate
comments: true
---

I was speaking to a participant at SG Ruby's [April meetup](https://www.meetup.com/Singapore-Ruby-Group/events/239105400/), and we discussed
what was presented: code review.

He pointed out that commit hooks should be used to check all the styles of the code, and that code-review should focus more
on reviewing the test cases, performance, alternative solution, etc.

That's a brilliant idea! I've never used git hooks before and turns out there's a ton of things you can do. There's even a http://githooks.com/

Here is one to invoke Rubocop to check your ruby styles before committing, with a free motivational prompt:

<script src="https://gist.github.com/keang/1066e8c0d2ca7face910491ac1794017.js"></script>

The hook can be checked into your project, so other team mates can benefit from the style check.
We won't run scripts on their machines without them consenting, though, so they have to opt-in:

```
ln -sf ../../pre-commit .git/hooks/pre-commit
```

Any teammate who is already using pre-commit in their work flow also gets a chance to merge their old hooks.

Hopefully this will save PRs from the rain of style-policing comments.
