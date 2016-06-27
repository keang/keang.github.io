---
layout: post
title:  "Rspec'ing a Rails JSON Api"
date:   2014-03-03 15:09:41 +0800
categories: bug rspec render_views
comments: true
---
`render_view` was the missing piece:
because rspec by default disables rendering of views to speed up the test. And that's how I was stuck for days trying to find bugs in the super short json.

```ruby
    describe Api::V1::TeamsController do
		render_views
		it "returns a json array of teams" do
		...
        json = JSON.parse(response.body)
        expect(json['teams']).not_to be_nil
        end
    end
```


