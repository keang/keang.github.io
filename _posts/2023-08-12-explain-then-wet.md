---
layout: post
title:  "EXPLAIN, then get WET"
date:   2023-08-12 23:43:21 +1000
categories: bug 
comments: true
---

The principle ["Don't Repeat Yourself" (DRY)](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) has been guiding me most of my career. 
But there are times that factorising everything and normalising everything can be counter productive. 
Then I found that there is also the principle "Write Everything Twice" (WET), from the linked wikipedia article. 🤣

Recently at work, we had two separate bugs/performance issues that was addressed by reversing a DRY postgresql schema.
We denormalised our table, avoided an expensive JOIN clause, and felt good about ourselves.

One was an [ETL process](https://en.wikipedia.org/wiki/Extract,_transform,_load) loading slightly enriched rows from Postgres into Amazon Redshift, where our analysts do their queries.
It's a table of `jobs`, and one of the enrichment steps is to add in the `categories` ids in to the record, so that queries will be faster (here the analysts had that great idea already).
Unfortunately this enrichment/denormalisation of categories at ETL time is too slow, and for a long, long period we lived without the jobs records being updated in Redshift. 😔 

When we finally came round to take another crack at this (there were multiple attempts in the past), we ran an EXPLAIN (and used the [awesome visualisation here](https://tatiyants.com/pev)), and found out that the most expensive part was a join to the table `jobs_categories`, which was a junction table presumably created by default when the many-to-many relationship was set up at the beginning of time. 
For context, our `jobs` table had grown quite big, and we had [partitioned it](https://www.postgresql.org/docs/current/ddl-partitioning.html) by a timestamp column, and dropping older partitions as they are no longer needed. 
Except that we did not also partition the junction table, and hence that table has many many useless rows, keeping track of jobs that we already dropped, again from the beginning of time.
The solution was to denormlise this junction table and make it an array column on `jobs`. This required a few coordinated steps:
- create the new column `jobs.category_ids`
- "double-write": we write to both the new column and the old junction table for new jobs records
- Backfilling: run a worker to update old `jobs` records with the category_ids 
- Update ETL query to use the new column instead of junction table.

We took the opportunity to port it from a custom Golang script to [Luigi pipeline](https://luigi.readthedocs.io/)) as well. The backfilling worker is still running, expecting to be done over the weekend, and next week we could roll out the new luigi ETL pipeline.

The second issue - similarly solved with "EXPLAIN, denormalise, avoid join" - was an internal admin console where a query spent 95% of query time in a single INDEX scan on the avoidable JOIN.
![a single slow join](/images/slow-join.png){: .center-imge }

Lessons learned: 
- EXPLAIN your queries
- The downsides of denormalisation may be worth the query performance boost
