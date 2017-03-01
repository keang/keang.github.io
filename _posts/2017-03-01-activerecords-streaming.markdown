---
layout: post
title:  "Streaming API with Rails and ActiveRecord"
date:   2017-01-15 13:51:00 +0800
categories: rails
comments: true
---

Sometimes there are cases where the response is too big, one way to reduce the memories and time used on the server(as well client!)
is to support HTTP streaming. [This article](https://gist.github.com/CMCDragonkai/6bfade6431e9ffb7fe88) gives a better introduction and informative overview.

Here I will show some code snippets to making a streaming API in Rails.

In Rails 4.2, we use (ActionController::Live)[http://api.rubyonrails.org/v4.2/classes/ActionController/Live.html], which is quite well documented.
