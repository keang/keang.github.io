---
layout: post
title:  "End to end application: Follodota"
date:   2014-03-13 02:30:41 +0800
categories: hack
comments: true
---
I've always wanted to build something related to DotA2, because it's such an awesome game and I've been spending at least 5 hours a week clicking away playing DotA. So for the past 3 weeks I've been working on a video aggregator app, [follodota](https://play.google.com/store/apps/details?id=com.follodota&hl=en), which consolidates the English commentated matches uploaded by joinDota and beyondTheSummit.

This is an end-to-end application that I built while learning on the job: a python script which crawls the dotacinema.com website for new content, a rails app as server hosted on Heroku to store and serve the match information with json api, and of course an android native app to play those videos.

Currently it is still in its infancy, and I still have to run the python script every now and then. The script only gets 15 entries because the [beautiful soup](http://www.crummy.com/software/BeautifulSoup/bs4/doc/) + [request](http://docs.python-requests.org/en/latest/) combo in python could not emulate a scrolling down event, which is needed to load more videos on [dotacinema.com](www.dotacinema.com/vod). Much more work to do :P

But for now, you can search the matches chronologically, by teams and by leagues (and easily by casters, but that's not implemented yet). My hope would be to get this thing ready for TI4!([last year's TI here](http://www.dota2.com/international/home/overview/))

<ul class="todo">Todo:
<li class="todoitem">add in some Gimmie awesomeness in gamification</li>
<li class="todoitem">an iOS client would be great too </li>
<li class="todoitem">and also to crawl for more matches. </li>
</ul>

Maybe a script to automatically run the crawling script (which automatically posts matches to through the api). autoception. hah.

