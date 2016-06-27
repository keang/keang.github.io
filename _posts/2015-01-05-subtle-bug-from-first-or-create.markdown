---
layout: post
title:  "Subtle bug coming from Rails' first_or_create"
date:   2015-01-05 19:09:41 +0800
categories: rails bug
comments: true
---
One very useful method provided by Rails is [`first_or_create`](http://apidock.com/rails/v4.1.8/ActiveRecord/Relation/first_or_create)

But there's a substantial probability that one might use it like this:

```ruby
Model.first_or_create(x: 1, y: 2)
```
<br>
At least I did at first. It caused a bug in that nothing ever gets created with `{x=1, y=2}`. This is because Model.first already returns an object - where(`id`=1) - so the create part doesn't get called.

The desired behaviour would be achieved by:

```ruby
Model.where(x: 1, y: 2).first_or_create
```
