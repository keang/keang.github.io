---
layout: post
title: "Buy low and sell high for me"
date: 2016-07-30 08:48:00 +0800
category: ai
comments: true
---
I tried my hands on algorithmic trading, in rather low frequency, and it works! sort of.

How I started
---
A friend introduced the opportunity to trade as he was beginning to do it as well. The very idea
was that we should come up with an automatic trading system, so that the process wouldn't be such a
roller-coaster ride for our greed/fear cycle. I was itching to work on a side project, so I was sold with building "automatic systems".
Also I was really interested in building a statistical model that describes and predicts well.

Looking for a hypothesis
---
I started reading [about candle sticks](http://stockcharts.com/school/doku.php?id=chart_school:chart_analysis:introduction_to_candlesticks)
(sort of like box-plot that I knew from statistics.) The names given to these chart elements are easy and descriptive, like
"dragon fly", "hammer" and "three black crows". These were introduced as signals that we can use to preempt the upcoming price movements.
So far so good, I started thinking about how I could write a module that recognises these established patterns from the OHLC(open, high,
low, close) ticks and buy/sell accordingly.

But it seemed a bit too simplistic and I needed more literature to back up my first hypothesis before I would start coding. I downloaded
Algorithmic and High Frequency trading. It's a text book, which painted for me a more definitive picture of the exchange market,
and I finally grasp the Invisible Hand that I have so affectionately referred to since JC economics. I also saw the process of defining
the decision, the cost function, finally analysing statistical models. Also a great takeaway is the concept of a
[statistical arbitrage.](http://www.mathworks.com/discovery/statistical-arbitrage.html?requestedDomain=www.mathworks.com)

Another book that I dived head first in was *A technical approach to trend analysis* by Michael C. Thomsett. It started out interesting, but quickly becomes
repetitive and unhelpful. Online forums provide better explaination and coverage. A friend introduced a good one -
[babpips.com](http://www.babypips.com/school) which strikes a good balance between being informative and humourous. If there's one
resource I would reccommend, it would the lesson series by babypips.com.

By the time I skimmed through all the extra resources, I came to settle on an initial hypothesis of trading with the Relative Strength Index (RSI), which is one particular way give a smoothed score out of 100 of whether the current price point is over-sold or over-bought.
As fun as the "shooting star" and "inverted hammer" were, that strategy introduced a level of complexity that I want to avoid in this pilot
hypothesis. So we have our hypothesis:

> RSI makes a good trading signal.

General Strategy
---
Because of the statistical nature of the hypothesis, the algo falls into a sort of technical analysis. Technical analysis is only one way to make sense of the prices of the market, working in tandem with fundamental analysis and sentimental analysis (to put it very concisely.) Now the plan is to only look at the RSI of the price of the instrument (forex or stocks or anything). Due to this neglect of fundamental factors of the instrument being traded, (be it the price/earning ratio of a company, or the employment rate of a country) the algo would benefit from choosing instruments which is more volative and liquid, involving more speculators and thus less affected by the left-out factors. Forex was a better fit for that compared to blue chip stocks (most of these reasoning are from babypips.com)

Another general strategy is to make lots of 0.7 probability trades rather than trying to find that a single 0.99 probability trade. The overal expectation should be profitable that way.

Choosing a language
---

My plan by this time was to build a fast backtest system, easily configurable algorithm, test with demo account, and then finally
trade with real account.
I tried to use this opportunity to learn a functional language that would be up to the task of building a fast backtest system. Scala was a
top candidate, with its promise of being friendly to OO programmers, and yet is also a full-blown functional language. Also it piggybacks on the rather mature java libraries echosystem. I'd skimmed through  through *Programming in Scala, Third Edition* by Venners, Odesky and Spoon. A great book with great introduction to functional programming,
by the way.

But it was grudgingly slow to learn to use a new tool while solving a new problem (up to this point I have not figured out all the things that a backtesting/trading system need to tackle). And with my daily allowance of 2 hours on this side project, I was loosing focus on the hypothesis that I set out to test. Because I wasn't going to trade in milliseconds anyway, python will do the job, as long as each backtest doesn't take crazy long hours. So I jumped back into familiarity, promising myself that I would incorporate the functional programming concepts that I'd picked up.

The current python module works well, taking no time to perform the hourly trade. It depends on pandas and scikit learn, the popular machine learning libraries. But it takes roughly 5 minutes to run a backtest for one configuration. I suspect after all the optimisations, a switch back to scala would bring about massive performance boost.

The algo
---
There is actually no proprietary algorithm going on. I just took the hypothesis and build a machine learning model around it. Remember we
started with this: **RSI makes a good trading signal**

I used scikit-learn's [random forest classifier](http://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html) to build a model the predicts whether the price would first climb to break an upper margin, slip past a lower margin, or remain in that band between the arbitrary margins. The input is the current close price and RSI.

The initial test is a static model that does not continuosly learn with new data yet. Wait for v0.2.

The outcome
---
I started with SGD2000 in a demo account, and the static model started making some trades:

![EUR_USD buy low 1](/images/eurusd1.jpg)

With a little bit of luck, those trades were good bets, gaining 16.99% in the 3 weeks:
![EUR_USD buy low 2](/images/eurusd2.jpg)

Note to self
---
One thing that I tell myself that I'd like to share here is that the initial succesful trades could be pure luck. It was after the shock of Brexit, something that rebounded back rather well. In a downward trend with a similar backdrop, the static RSI algo would continue to buy and make losses.

While I attempted to spread the risk of trades by making many many small trades, the probability that each of those clusters of trade
profiting is not independent, the expectation is not `n x P` and thus the risk diversification effect is not as much as I first imagined.

Spreading the strategy to different currency pairs would add greater diversification, but the coupling is still there because firstly, both EURUSD and AUDUSD are affected by USD's strength; and seocndly it's economics, everything is linked to everything.

TODO
---

The next things to do are probably:

  * Heurisitic algorithm
  * Try [tensorflow](https://www.tensorflow.org/)'s deep learning
  * Web interface to edit algorithms and test, something like [Quantopian's zipline](https://github.com/quantopian/zipline)

