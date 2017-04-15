---
layout: post
title:  "Streaming API with Rails and ActiveRecord"
date:   2017-03-01 17:36:17 +0800
categories: rails
comments: true
---

Sometimes there are cases where the response is too big; one way to reduce the memories and time used on the server(as well on client's side!)
is to support HTTP streaming. [This article](https://gist.github.com/CMCDragonkai/6bfade6431e9ffb7fe88) gives a better introduction and informative overview.

Here I will show some code snippets to making a streaming API in Rails.

In Rails 4.2, we use [ActionController::Live](http://api.rubyonrails.org/v4.2/classes/ActionController/Live.html), which is quite well documented.

```ruby
describe ' GET /my_stream' do
   let(:expected_records) do
     SoftwareEngineers.where('job_satisfaction > 9.0').select(:id, :title, :name)
   end

   before { get '/my_stream' }

   it 'returns one line for each processed lists' do
      expect(response.code).to eq '200'
      response_lines = response.body.split('\n')
      expect(response_lines.count).to eq expected_records.count
      expected_records.each do |e|
        expect(response.body).to match("#{e.id} #{e.title} #{e.name}\n")
      end
    end
  end
end
```

```ruby
class Api::MyStreamController < ApplicationController
  include ActionController::Live

  STREAM_SIZE = 128 * 1024  # Using nginx proxy_buffer_size

  # GET /my_stream
  #
  def my_stream
    response.headers['Content-Type'] = 'text/plain'
    select_query = "SELECT id, title, name FROM software_engineers WHERE job_satisfaction > 9.0"

    # Unbuffered db query is needed so that we don't need to load all
    # results before writing to stream. We call #query on mysql2.connection object
    # directly as ActiveRecord::Base.connection doesn't support unbuffered query.
    ActiveRecord::Base.connection_pool.with_connection do |conn|
      mysql2_conn = conn.raw_connection
      results = mysql2_conn.query(select_query,
                                  stream: true,
                                  cache_rows: false)
      body = ""
      results.each do |row|
        body << "#{row[0]} #{row[1]} #{row[2]}\n"
        if body.size > STREAM_SIZE
          response.stream.write(body.slice!(0, body.size))
        end
      end
      response.stream.write(body)
    end
  ensure
    response.stream.close
  end
end
```

If nginx is used as the reverse proxy, the following is needed:
```
location / {
  proxy_http_version 1.1;
}
```

It was a pain debugging nginx config :(

