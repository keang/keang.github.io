---
layout: post
title:  Adventures in upgrading to Ruby 3.2
date:   2023-12-08 22:53:07 +1100
categories: bug
comments: true
---

> Code profiling

> survivorship bias

> "just write better code".

Our worker enriches a incoming stream of jobs. 
We have enough of a volume that, even though we frequeuntly clear the queue, our histogram of processed jobs is still quite flat.

For a major release, where we brace ourselves for degraded performance, we roll out the change to a small fraction of the workers(canary) and let them run alongside the maste branch. When the metrics check out and the exceptions logger is quiet, we declare that the change is good and merge it into master.

This time we upgraded our Ruby version from 3.1 to 3.2, enabled YJIT, expecting our workers to be faster. Canary cluster that's running Ruby 3.2 was rolled out, and *\*drumrolls\** ... it was slower!

![Ruby 3.2 with YJIT was slightly slower than 3.1](/images/ruby-32-slower.png){: .center-imge }

It wasn't anything crazy through most of the time, exception for some hours where canary really tanked.
This wasn't the result we were hoping for, but then the increase in process times weren't bad enough to block the whole epic, so we decided to roll it out to master, and carry on the upgrade in other projects, then make a ticket to circle back to dig deeper into this at the end of the epic. 
We often take up such short-term tech debt, and promise to pay it back soon while we still have the context still fresh in our heads. 

About a month later, we finally came back to it. (After some team members returned from leave too). 
After an amount of time that I'm not proud to disclose, we concluded from our existing metrics that only one worker step that degraded in performance: the piece that queries mongo and evaluate the returned results to find the best match. 
The evaluation of the query result was done in Ruby, rather than included in the query to Mongo because it was a hueristics based algorithm.

I reached for code profiling, because now we are trying to compare 2 different code, and peek into the differences that makes canary so much slower.
After failing to integrate Datadog Continuous Profiling, I went back to adhoc profiling, this time using [stackprof](https://github.com/tmm1/stackprof) and the accompanying flamegraph viewer [stackprof-webnav](https://github.com/alisnic/stackprof-webnav) (complete with a minimap!) 

![Flamegraph identified OpenStruct as the culprit](/images/stackprof-webnav-ruby-32.png){: .center-imge }

Found the culprit! OpenStruct. (probably not clear from the static screenshot above though)

Well, besides YJIT, the other interesting addition in Ruby 3.2 was the [Data class](https://docs.ruby-lang.org/en/3.2/Data.html); perfect time to refactor!
Profiled code snippet proved that our fix works, we improved the performance by about 66%!

As a bonus, after this refactor to change OpenStruct into Data class is done, we realised that these instances of immutable data were only needed when we want diagnostic data for this worker step.
Actually we don't even need to log these stuff all the time.
Treating these data as a diagnostic data, we guard them behind a flag, thus bypassing the expensive operation altogether.
After this change, the profiled code perfomed slightly faster than the original Ruby 3.1 code. Phew!

Aparently, JIT push [OpenStruct from bad to worse](https://www.reddit.com/r/ruby/comments/11wem2c/comment/jd4zr8a/?utm_source=share&utm_medium=web2x&context=3).

We rolled out this change to a new canary. 
I eagerly monitored the next hour of charts. 
Lo and behold, the metrics shows it's *\*drumrolls\** ... slower now?!

Maybe we didn't JIT enough? I considered switching to TruffleRuby for the ultimate JIT'ing. I almost threw in the tower here and decided to go to sleep.

The next morning, more logs were added, and particulary useful is the actual raw value in the field when the problemataic step took too long.
I ran the profiling code again, and indeed it took so very long on Ruby 3.2 even with the fix. 

On Ruby 3.2 before the fix, the profiling script got killed by the OS. 

On Ruby 3.1, the script again got killed by the OS. 

<figure class="image is-128x128">
    <img src="/images/surprise-pikachu.png" alt="Surprise pikachu" class="center-imge">
</figure>

ECS was killing the jobs that ran out of memory. :facepalm: [Survivorship bias!](https://en.wikipedia.org/wiki/Survivorship_bias) 
This fallacy caused us to be blinded from the really slow jobs. They were so bad that we just killed the container and didn't even send the timing metirc.

And the fix was good enough that we were able to complete those paralizing jobs, such that larger timing values were sent in and brought the 95-percentile stats up.

This hypothesis was supported by the fact that after we rolled the fix out to master, the aggregated metrics did improve, and now the worker is indeed slightly faster than what it was before the ruby upgrade, just as predicted by the adhoc profiling exercise.
The canary worker were just unlucky and picked up the poisonous data in the hour that I was monitoring.

![Ruby 3.2 recovered](/images/ruby-32-recovered.png){: .center-imge }

# Conclusion

- So in the end JIT didn't do much for us, but understanding the code we inherited and optimizing them was the answer. 
- Profiling saves the day again!
- We need better observabaility: 
  + Hunting down the slowest steps in the worker using Datadog should be more systematic
  + We should start monitoring how our ECS tasks exit
- We need better canary process/guideline: 
  + test the canary changes in production for longer, until the [law of large numbers](https://en.wikipedia.org/wiki/Law_of_large_numbers) kicks in, 
  + or do a direct comparison on a golden test set. 

