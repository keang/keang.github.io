---
layout: post
title:  "Non-utf8 vs Mongodb"
date:   2015-07-23 03:23:41 +0800
categories: bug
comments: true
---
We saw 3 instances of a user agent string that broke our Python queries; It came with a non-utf8 encoded ["orange.espana"](https://en.wikipedia.org/wiki/Orange_Espa%C3%B1a).

[Pymongo](https://pypi.python.org/pypi/pymongo/) throws an error (`UnicodeEncodeError`) when a query with those documents are returned. And we never get to see the id or anything of the related document. But scoping the query to logs from different time frame made the query go through, so we figured we just need to remove the offending document.

Turns out it's actually really hard to find the offenders.

Beacause the query `db.collection.find({"user_agent":/orange.esp/})` doesn't return the `"orange.espana" doc, because probably the non-utf8 string is skipped when searching for match.

But luckily the query only fails in the python client, and when we use the mongo console, we are able to print everything out, offending or not. So we did a binary search and narrowed down to a small enough scope that we can just scroll through and find the '?' and out of frustration we purged the entries.

Wth happened to the device that sent non-utf8 user agent?! And only 3 instances of them -.-

It was interesting that mongo didn't complain when we save non-utf8 strings in the document, through the [golang client](http://godoc.org/gopkg.in/mgo.v2); Gotta test that out again and document it. Now we do a unidecode on incoming user agent strings, just in case it would save us from squinting our eyes through hundreds of user agent strings again.

