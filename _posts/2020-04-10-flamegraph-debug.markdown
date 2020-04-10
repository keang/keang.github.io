---
layout: post
title:  "Using flamegraph to improve debug CPU increase"
date:   2020-04-10 21:51:43 +1000
categories: bug
comments: true
---

Recently I worked on an simple but worthwhile project: refactor our ads service to stop reading values from db, and
grab everything from our elasticserach direclty. This decoupling would allow us to more confidently upgrade our database to the next major version,
which requires a shut down of the database, and thus interupted ads service.

Most things were quite straight forward, and there were some challenges denormalising a few fields to keep both the indexing and reading performant.
However when we finally deployed the changes, we had to roll back within 5 minutes because the response time wasn't satisfactory. The 95-percentile
resposne time had too big of an impact, that it went beyond the SLA with the team who were requesting for ads.

![response-time-increase](/images/response-time-increase.png){: .center-imge }

Correlated to the time spent in the controller, all the boxes had an increase in CPU usage as well.

The first suspect was that our refactor to make the code more readible was introducing too much inefficiency. Then I ran a benchmark comparing
the two code, something like below:

```
   require 'benchmark'
    matched_ads = [
      AdResponse.new(name: 'Ad 1', remainder_percentage: 20),
      AdResponse.new(name: 'Ad 2', remainder_percentage: 20),
      AdResponse.new(name: 'Ad 3', remainder_percentage: 20),
      AdResponse.new(name: 'Ad 4', remainder_percentage: 20),
      AdResponse.new(name: 'Ad 5', remainder_percentage: 20)
    ]
    ads_request = AdsRequest.new(country: 'AU', site_id: 1, ads_per_page: 3, page_num: 1)
    Benchmark.bm do |x|
      x.report 'AdsPicker' do
        100000.times do
          chosen_ads = AdsPicker.new(ads_request).pick(matched_ads)
        end
      end
      x.report 'EcpmOptimiser' do
        100000.times do
          chosen_ads = EcpmOptimiser.new.optimise(ads_request, matched_ads)
        end
      end
    end
```

That quickly falsified the hypothesis, as the new code was only minimally slower, and should not explain the doubling of the repsonse time.

The next hypothesis was the jackpot: "The cpu usage could also be from deserializing the ES responses?"
To test this, running another benchmark was a bit limitted, because we already know that the new code,
which requests a new elasticsearch index, and skips db queries, is actually slower, we just don't know where.
In the controller, all other code paths are common, so to resolve or to test the slower ES response parsing, we'd want to SEE where cpu is spending
the time.

[Flamegraph](https://github.com/SamSaffron/flamegraph) to the rescue! The idea is the tool will take a snapshot of the current stacktrace
at regular interval, and the codes that show up the most are those that our CPU spending the most time on.

![flamegraph-comparison](/images/flamegraph-comparison.png){: .center-imge }

It took a while to explore the graph, but soon enough the culprit was identified: `Mash#initialize` takes up a big bunch of time in the slow code.
There were 2 large object fields that our response had to parse: metadata and keyword_cpm.

We changed metadata to be named metadata_json, and make it of type string, because luckily that field is only required to be returned vertabim back to client.
For keyword_cpm, a neat trick was used: convert the object to a string array instead. Original the data looks something like:
```
{ "ruby": 0.3, "developer": "0.1" }
```
We serialised that into an array like below instead:
```

["ruby|0.3", "developer|0.1"]
```

With those 2 changes, we are able to get rid of the extra calls to parse json string into Hash/Mash.

![flamegraph-comparison-improved](/images/flamegraph-comparison-improved.png){: .center-imge }

And finally we are able to improve by our json ads response time by about 50%, and also introduced a dramatic improvement in max response
time for image ads. But of course that is the result of many optimisations on many front, not just the ones discussed above.

This was a satisfying epic to work on!

