---
layout: post
title:  Adding a static typed component to a mature Ruby project
date:   2023-12-15 09:35:48 +1100
categories: hack
comments: true
---

> Ruby is nice, but...

Ruby is convenient and productive and ergonomic.
It is a great language to prototype in.

But when a project matures, requirements starts to stabilize.
Changes in the domain happens slowly.
It takes discipline to maintain the growing pile of test cases, which are essential for any form of deployment confidence.

> too many foot guns

If you inherit a poorly tested code, good luck.
If you push the boundary of the Rails convention, have fun.

I heard another way to put it: there are many foot guns in the language. 
On top of that, after you shot yourself in the foot, you *want* to take the blame. 
If only I was smarter or had more foresight or was more disciplined, I could've done it the right way that time.

So at work I started to explore other non-foot-shooting figurative guns.

I started with some criteria (an ex-colleague sold me the first 2):

1. Support composable types and pattern matching
1. Discourage unhandled exceptions
1. Interop with Ruby

### 1. Support composable types and pattern matching

Composable types, or [algebraic data types](https://en.wikipedia.org/wiki/Algebraic_data_type), would be an interesting tool for expressive business domain modeling.
Languages with composable type also offers exhaustive pattern matching, which promises to catch bugs where we forget to consider edge cases. 
Of course it depends on the models being well-designed.

I tried to make use of composable type and pattern matching in Ruby first, by introducing Sorbet(a Ruby static type checker) but currently it still fall short.
The [exhaustive pattern matching](https://sorbet.org/docs/exhaustiveness) check doesn't work quite well, for example with an array of 2 booleans:
```ruby
sig {params(a: T::Boolean, b: T::Boolean).returns(T::Array[Event])}
def resolve(a, b)
  case t = [a, b]
  when [true, false]
    "Half-half"
  when [true, true]
    "All in!"
  when [false, false]
    "Noooo"
  when [false, true]
    "Half-half again"
  else
    T.absurd(t)
  end
end
```

We have to sprinkle in `T.absurd(t)` call to make the checker assert whether the code is dead (meaning that the branches above are exhaustive). This still throws an error:
```ruby
editor.rb:44: Control flow could reach T.absurd because the type [T::Boolean, T::Boolean] wasn't handled https://srb.help/7026
    44 |    T.absurd(t)
            ^^^^^^^^^^^
  Got [T::Boolean, T::Boolean] (2-tuple) originating from:
    editor.rb:34:
    34 |  case t = [a, b]
                   ^^^^^^
Errors: 1
```

We already covered all combinations, but Sorbet still thinks we have not covered `T::Boolean, T::Boolean` :(


### 2. Discourages unhandled exception

The presence and prevalence of runtime errors as control flow in Ruby violates the [Principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment), and necessitate meticulous use of `rescue`s.

Half of a Ruby dev's time is debugging the runtime errors. Is [this monstrosity](https://www.exceptionalcreatures.com/bestiary/NoMethodError.html#undefined-method-for-nil-nilclass) familiar in your error logging service?

```
NoMethodError: undefined method `rawr' for nil:NilClass
```

It would be better to handle errors/exceptions as return values where the caller explicitly decides what to do up-front.
In many languages, it is idiomatic to return a `Result` type that wraps around the successful value and the failed exception. 
This gives the compiler a chance to assist us to write better error handling.


### 3. Interop with Ruby

Since the project is quite big, a rewrite into a new language would be a hard sell for the team. 
We want a way to dip our toes into the waters first before investing more into a particular language/technology.
It is a requirement that the new language should play nice with Ruby, so that we could gradually replace components in current Ruby projects. 

There are 2 main ways to interop with Ruby: 
1. compile into a shared dynamic library, and Ruby uses FFI to bind with said library, or 
2. Run Ruby in JRuby or TruffleRuby which supports JVM languages quite well (Java, Kotlin and Scala)

# Candidates

After some googling, the following is the list of possible languages that we could explore:

{% assign T = '<i aria-hidden="true" title="Yes" class="has-text-primary fa-solid fa-check"></i>' %}
{% assign F = '<i aria-hidden="true" title="No" class="fa-solid fa-xmark"></i>' %}
| Language   | Pattern Matching | "Result" type | Interop with Ruby                                                                        |
|------------|------------------|---------------|------------------------------------------------------------------------------------------|
| Crystal    | {{ T }}          | {{ F }}       | {{ F }}                                                                                  |
| TypeScript | {{ T }}          | {{ F }}       | {{ F }}                                                                                  |
| Elm        | {{ T }}          | {{ T }}       | {{ F }}                                                                                  |
| F#         | {{ T }}          | {{ T }}       | {{ F }}                                                                                  |
| Haskell    | {{ T }}          | {{ T }}       | {{ F }}                                                                                  |
| Kotlin     | {{ T }}          | {{ T }}       | {{ T }} [Kotlin/Native](https://kotlinlang.org/docs/native-dynamic-libraries.html) + FFI |
| Rust       | {{ T }}          | {{ T }}       | {{ T }} [Magnus](https://github.com/matsadler/magnus)                                    |
| Scala      | {{ T }}          | {{ T }}       | {{ T }} (Scala Native + FFI) or TruffeRuby                                               |
| Swift      | {{ T }}          | {{ T }}       | {{ T }} [FFI](https://medium.com/@MarcioK/swift-ruby-interoperability-9a0ce9a70fd2)      |
{: .table}

In subsequent posts I would like to get into more details of each languages that we tried:
- [Rust](/posts/rust-extension.html)
