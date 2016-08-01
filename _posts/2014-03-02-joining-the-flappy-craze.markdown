---
layout: post
title:  "Joining the Flappy Craze"
date:   2014-03-02 13:33:41 +0800
categories: hack
comments: true
---
**tl;dr**: my flappy clone [here](http://keang.github.io/flappy-quiz/).

Being swept by the recent craze for flappy bird, I wanted to pass on this little birdy frustration and at the same time make something fun. I love the fact that flappy bird is so frustratingly simple that to play you have to focus on some thing else other than the bird to do well. Some people suggesting looking at the skies behind. Some at the moving pipes. Others go further to add a [typing training in there](http://www.mrspeaker.net/dev/game/flappy/).

One interesting version I found was this awesome [flappy maths saga](tikwid/flappy-math-saga) which puts your multiplication power to the test. It's beautiful because the attention split needed there really proves as a good brain teaser. I thought this could extend to other fields as well, so I wanted to make a frustrating quiz engin for multiple choice questions. But the pipe is only so long, so only true/false type questions and 2-choices were possible.

I told this to my girlfriend and she said her english class full of 13yo's will love it. We used google spreadsheet to compile a small quiz, which I was planning to hardcode into the modified html flappy. But while sharing the google spreadsheet I remembered that it could be made a public link, and so there should be a way to read the content of the public spreadsheet directly from the html.

>"The (sec2) kids went bananas!"

Turns out google spreadsheet do have an API, but the documentation is scarce and full of redirects between a few versions. From [this example](https://developers.google.com/gdata/samples/spreadsheet_sample) I figured out how to read the columns of a public spreadsheet, and voila, flappy-quiz just got its sheety backend wired up.

````javascript
	//load questions
	$.getJSON("http://cors.io/spreadsheets.google.com/feeds/list
		/[google-sheet-uid]/od6/public/basic?alt=json", function(data) {
    	var rows = data.feed.entry;
    	for(var i=0; i<rows.length; i++) {
        	var t = rows[i].content.$t.split(/[ ,]+/);
        	var question = {word:rows[i].title.$t, correct:t[1], wrong:t[3]};
        	questions.push(question);
		}
		isQuestionLoaded = true;
	});
````


Now anyone with the spreadsheet link(and with permission) can update it, and the flappy bird will have a different problem to solve to go through the pipes!

See it [flapping live here](http://keang.github.io/flappy-quiz/) and if you want to, [fork from here!](http://keang.github.io/flappy-quiz/)
