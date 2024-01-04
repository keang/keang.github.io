---
layout: post
title:  Domain Modeling Made Functional
date:   2024-01-04 19:58:12 +1100
categories: review
comments: true
---
While searching for more materials on Union Type when modeling, I stumbled on [this talk by Scott Wlaschin](https://www.youtube.com/watch?v=2JB1_e5wZmU). 
And from there I found the book of the same title: ["Domain Modeling Made Functional"](https://pragprog.com/titles/swdddf/domain-modeling-made-functional/)

The book work through an example domain, on Order processing module. 
I thoroughly enjoyed reading the gentle introduction into Domain-Driven Design, something I tried to dip my toes into before but it didn't really click until now. 
It is able to add a non-trivial level of scope, while demonstrating the thinking processes and explaining the design choices along each step.
It is also a gentle introduction to functional programming concepts and principals, such as immutability, higher-order functions, currying, monads, pattern matching, composibility, etc.

Some points that I found interesting:

# Make a Type for all the things!

Your Order type has an Id field? Straight to type: `OrderId`

Your Order id is a string that is less than 50 chars? Straight to type: `String50`

Your customer may or may not be a VIP customer? No, not a boolean. Straight to type: `VipStatus = Normal | Vip`

# Function compositions everywhere in F#

Each function are kept small and complex behaviors are achieved by composing them together, much like a complex bash script that's made up of small well-defined programs piped together.

Keeping functions small makes it easier to test.

# Data transfer object

This is sort of an example of the above point. Rather than making changes to the database directly, a function containing the business logic just returns the "decision", an object representing what to change in the database. 

The actual database persistence is delegated to another function specializing in that.

# Onion Architecture

Domain objects and business logic lives in the innermost layer.
Public interface is the outer most layer. There're DTO, serializers, persistence layers etc in between, and each layer can only depend on the inner layers.

This bit highlighted the benefits of separating persistence layers from the domain layer, of which I've been doing the opposite, with my fat ActiveRecord models.

# Verdict

Highly recommended read!
