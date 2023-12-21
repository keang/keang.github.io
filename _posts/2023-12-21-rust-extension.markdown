---
layout: post
title:  Adding Rust to a mature Ruby project
date:   2023-12-21 23:10:28 +1100
categories: hack
comments: true
---

This is NOT a Rust guide for Rubyists.

We wanted to exploring porting a component of our Ruby worker into a static typed functional language, as detailed [in this post](/posts/ruby-static-typed-extension.html), so naturally we jump into Rust.

Earlier this year [Bundler added a flag to generate a gem with Rust extension.](https://bundler.io/blog/2023/01/31/rust-gem-skeleton.html) From that guide we were able to get a proof-of-concept gem going.

# Pattern matching

The original intent to use a functional typed language was to utilize pattern matching on union types. However I couldn't quite see this feature in action yet, because the proof-of-concept work didn't bite a big enough chunk.

The one bit that we have done now is matching on the `Result` type:

```rust
    pub fn failure_codes(&self) -> Vec<String> {
        match self.validate() {    // <------- this returns a Result<(), ValidationErrors>
            Ok(_) => vec![],
            Err(e) => e
                .field_errors()
                .into_iter()
                .map(|(_field, errors)| {
                    errors
                        .into_iter()
                        .map(|error| error.code.to_string())
                        .collect::<Vec<_>>()
                })
                .flatten()
                .collect::<Vec<_>>(),
        }
    }
```
Result could be matched into 2 cases, Ok or Err.

# Result type

Rust has first class support for the `Result` type, which basically replaces Ruby's `raise`. 

Though unlike Golang, it can look quite inconspicuous when we ignore the error:
```rust
impl job {
    pub fn new(kw: rhash) -> self {
        deserialize(kw).unwrap()
    }
}
```
The above would panic (raise a runtime error) if the method `deserialize` didn't succeed.
I suppose it still takes judgement and discipline to implement all the erorr handling upfront.

There is also an idiamatic way of bubbling up the error so the caller handle the error instead: 
```rust
impl job {
    pub fn new(kw: RHash) -> Result<Self, magnus::error::Error> {
        let v: Job = deserialize(kw)?; // <--- This statement either succeeds and assigns to "v", or fails and returns an Err to the caller of "new"
        Ok(v)
    }
}
```

# There are a lot of meta-programming

In Rust there are many marcos, which are like annotations that generates more Rust code. For example:

```rust
use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Validate, Deserialize)]
#[magnus::wrap(class = "Qc::Job", free_immediately, size)]
pub struct Job {
    pub title: String,
    // ...
}
```

Here `Debug` is a stdlib "trait", whereas `Validate` and `Deserialize` came from the crate "serde" and "validator". I (ab)use quite a lot of meta-programming in Ruby, and it was interesting to see that in the supposedly "less magical" language.

# Crossing worlds

[Magnus](https://github.com/matsadler/magnus) allows us to define Ruby classes and modules right from the Rust codes, without any Ruby code at all. 
I only had rspec in the Ruby world.
The downside is that doing so is quite verbose:
```rust
fn init() -> Result<(), Error> {
    let qc = define_module("Qc")?;
    qc.define_singleton_method("check", function!(check, 1))?;

    let job_class = qc.define_class("Job", class::object())?;
    job_class.define_singleton_method("new", function!(Job::new, 1))?;

    let qc_result_class = qc.define_class("Result", class::object())?;
    qc_result_class.define_method("reject_job?", method!(QcResult::reject_job, 0))?;
    qc_result_class.define_method(
        "reject_job_by_score?",
        method!(QcResult::reject_job_by_score, 0),
    )?;
    qc_result_class.define_method("total_score", method!(QcResult::total_score, 0))?;
    qc_result_class.define_method("failure_codes", method!(QcResult::failure_codes, 0))?;
    qc_result_class.define_method("failed_checks", method!(QcResult::failed_checks_hash, 0))?;
    qc_result_class.define_method("inspect", method!(QcResult::inspect, 0))?;

    Ok(())
}
```
This adds incentive for us to keep the API/interface narrow.

I wasn't able to get the Rust code to use a class already defined in the Ruby world, so for example we can't pass a Ruby instance of `Job` directly into the Rust world, but instead we pass the serialized data in, and let Rust/magnus deserialize into a corresponding Rust type instead.

# Distracting memory management code
As seen in the example for the pattern matching, there are a lot of calls to `iter()`, `clone()`, `to_string()` and `collect()` which would not be needed in Ruby. 

```rust
            Err(e) => e
                .field_errors()
                .into_iter()
                .map(|(_field, errors)| {
                    errors
                        .into_iter()
                        .map(|error| error.code.to_string())
                        .collect::<Vec<_>>()
                })
                .flatten()
                .collect::<Vec<_>>(),
```

I think these are quite distracting, when we're trying to read the business logic. But I suppose Rust did not promise to be concise.

# Language server is quite good

While the compiler is quite loud and screams at you with initially confusing message, I imagine we could get familiar with the them.
The great thing is usually there are suggestions to fix the given error, and the LSP is able to apply the suggestions as well. 
For example, this screenshot from Emacs showing that we could apply a "code action" to address the compiler complaint: 
![rust LSP action screenshot](/images/rust-code-action.png){: .center-image.box}
 
# Verdict
Although its verbosity and many unfamiliar concept makes it a steep hill to climb, I think Rust satisfies the criteria to help us write better, less buggy code. 
I'm looking forward to comparing the next candidates, Scala and Kotlin, to Rust!
