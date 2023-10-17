---
layout: post
title:  Custom optimistic lock
date:   2023-08-18 00:14:03 +1000
categories: hack
comments: true
---

# UPDATE table WHERE id=1

When we update an [ActiveRecord](https://guides.rubyonrails.org/active_record_basics.html) object, the generated SQL conditions on the primary key. For example:

```ruby 
u = User.find_by(email: "example@email.com")
u.update(name: "example-updated@email.com")
```

We see the following logs

```
TRANSACTION  (4.1ms)  BEGIN
User Update  (4.7ms)  UPDATE "users" SET "email" = $1, "updated_at" = $2 WHERE "users"."id" = $3  [["email", "example-updated@example.com"], ["updated_at", "2023-08-14 17:57:38.465600"], ["id", 1]]
TRANSACTION  (24.3ms) COMMIT
```

# Race condition

A [race condition](https://en.wikipedia.org/wiki/Race_condition) is a scenario that arises when multiple workers try to write to the same row, concurrently.
When I first learnt of the term, I thought that this is a rare scenario that only the busiest systems, doing high frequency trading or something, that needs to handle that.

But "concurrently" doesn't mean "the database receive the UPDATE request at the exact same moment in time"; the two workers could be long running transactions, that finished in an unexpected order.
For example, at work we have an enrichment pipeline which processes incoming events for a model:

- make some API queries, 
- update with interesting enrichments, 
- and then save to the database.

The process would take 1s to 5s. 
But because we have a lot of dependent downstream APIs with retries, the process time could spike to 150s 😱
During that time, if a second event is fired from upstream, then we have very high probabilty that the second event finishes earlier and tries to save to the databse first.

# Half-empty or half-full

There are two strategies to address a potentially-racing update: pessimistic or optimistic locking.

In pessimistic locking, we assume someone would try to touch our row and so we lock everyone else out.
[Postgres provides](https://www.postgresql.org/docs/current/mvcc-intro.html) 2 mechanisms: 
- **transaction isolation levels**: we declare that our transaction requires an elevated level of isolation, so when both workers commit, postgres would tell teh 
- **locks**: we explicitly aquire a lock for the row, and release it after we're done

On the other hand, optimistic locking assumes that most of the time the updates would happen fine, and a race condition is a rare scenario. 
so we first attempt to update the row, adding a condition that the row we're updating still looks like what we expect. 

To recap, the issue we're trying to address is that our worker processing time sometimes spikes, rendering it unable to process events in quick succession correctly.
For pessimistic locking to rectify this, we need the transaction/lock to start when the worker picks up the job, and release when the worker finishes. 
150s. 
If raised transaction isolation level was used, we can't update any records that was read in that transaction. (? I haven't tested this, just from what I understood when reading the manual.)


Our history of production issues is dominated by database lock waits building up and hogging connections, so we are keen to explore alternatives to database locks.

Optimistic locking in effect it is only an additional condition in our UPDATE statement. This seems like the way to go.

# Custom lock

I set out to implement that idea: add an additional condition when we do `ExampleModel#save`. It ended up being a module called `SaveWithOptimisticLock` that patches three ActiveRecord methods:
- `.__update_records`
- `#_update_row`
- and `#create_or_update`

I did feel kinda dirty, monkey patching private methods with names starting with an underscore.

But while debugging my attempt, I learnt that this is how a lot of core ActiveRecord features are implemented: 

- `ActiveRecord::AttributeMethods::Dirty`
- `ActiveRecord::Timestamp`
- etc...

I saw a whole list of modules included into `ActiveRecord::Base`, two of which were `Locking::Optimistic` and `Locking::Pessimistic` 🤦‍♂️
This was actually the moment I found out that these strategies were called Optimistic and Pessimistic Locking.

However we still had to stick to our hand rolled optimistic locking module, because the convention-based implementation from ActiveRecord requires that our model has a database column storing the version number of the records.
Earlier, we had decided to store that data in a jsonb column instead, so we needed our extra condition to read like:

```ruby
m.assign_attributes(updates)
m.save(optimistic_lock: ["metadata->version = ?", m.metadata[:version]])
```

# In the end

In the medium term though we may just bite the bullet and add a new column for the model, because now we're discovering that the race condition is not confined to the busier "partition" of the business.
So we might be able switch to the officially supported `Locking::Optimistic`.

Anyways, it was an interesting ticket to work on, and the final solution would pass as an nice open-source Rails module (with a bit more work), so I enjoyed the whole process. 
