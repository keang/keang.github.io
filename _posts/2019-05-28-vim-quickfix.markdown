---
layout: post
title:  "Quick error navigating with Vim QuickFix"
date:   2019-05-28 18:59:40 +1000
categories: automate
comments: true
---

Here I'll show how I setup vim's quickfix together with the output of rspec and pronto to minimize keystrokes.

A lot of us spending a lot of time writing tests, running them, and fixing them. For me, since I use vim and tmux, the steps goes something like this:
1. Change some code
1. Trigger test (in vim normal mode: `mtn`)
1. Test gets executed in tmux pane, either in the background or in an unfocused pane
1. Read the error message, decide which file:line is the culprit
1. Navigate to that file with `Ctrl+P`
1. Navigate to that line with `<n> gg`
1. Rinse and repeat

And then there's a [post-commit lint](/automate/2017/04/27/style-check-hook.html) script that checks the new code that I just committed. That would output any issues to the stdout of the tmux side pane. The steps involed would look something similar to:
1. Trigger lint check (either by committing cod, or manually with `mrr` in normal mode)
1. Read the error message, decide which file:line is the culprit
1. Navigate to that file with `Ctrl+P`
1. Navigate to that line with `<n> gg`
1. Rinse and repeat

In both cases, I've become keenly aware that there're 3 common steps that looks like an inefficientcy, arising from suboptimal flow of information: the terminal already has the file name and line number, but those information still had to travel through my eyes, brain, fingers and keyboard back to the vim terminal.

[QuickFix](http://vimdoc.sourceforge.net/htmldoc/quickfix.html) comes to the rescue. I've been unknowingly using this feature with project-wide search(using ag.vim or ack.vim), where I can navigate to a result list, hit Enter and go to the listed location. It turns out we can load any file into this QuickFix list, as long as the format follows the right errorformat:
```
<filename_with_relative_path>:<line_number>:<message_about_error>
```

Since I'm lazy I decided to customize the error output to fit the default format instead.

### Rspec quickfix output

See details in this [blog post](http://www.philipbradley.net/rspec-into-vim-with-quickfix/). I modified his examples though to have less personalization in the shared codebase.

#### 1. Create a rspec formatter
In `~/rspec_quickfix_formatter.rb`, have something like:

```ruby
# Format rspec output for vim quickfix
class QuickfixFormatter
  RSpec::Core::Formatters.register self, :example_failed

  def initialize(output)
    @output = output
  end

  def example_failed(notification)
    @output << format(notification) + "\n"
  end

  private

  def format(notification)
    rtn = "%s: %s" % [notification.example.location, notification.exception.message]
    rtn.gsub("\n", ' ')[0,160]
  end
end
```
#### 2. Tell rspec to use it by default
RSpec allows global options which are overrided in order of specificity, so ~/.rspec can be overrided by $PROJECT_PATH/.rspec, which in turn can be overrided by command line options.
So what I have in my global config file is as bellow:
```
# ~/.rspec
--color
--require /Users/<you>/rspec_quickfix_formatter.rb
--format QuickfixFormatter --out tmp/.quickfix_list
--format progress
```

This would output the format into a tmp file, but still show the progress format in stdout for more detailed error messages.

#### 3. Tell vim to load the output
I map `mre` to load quickfix list from rspec output, and open the list as well:
```
nnoremap <Leader>re :cf tmp/.quickfix_list<CR>:copen<CR>
```

Voila!

### Pronto quickfix output
#### Make pronto output the right format
For pronto, the output format could be confiugred as well in a `.pronto.yml`, but since the default output is just missing one `:`, I have a small `sed` running to fix the output instead.
The following is my post-commit script:
```bash
# .git/hooks/post-commit
#!/bin/bash
./bin/pronto > tmp/.pronto_output

if [ $? != 0  ]; then
  echo "Fix offences! See errors in ./tmp/.quickfix_list"
  sed -E 's/ /: /' tmp/.pronto_output > tmp/.quickfix_list
else
  # Try to remove the quickfix_list, but supress the errors in case the
  # file isn't there if previous run was also error-free
  rm tmp/.quickfix_list 2> /dev/null
fi
```

I spend quite a big chunk of work writing in vim and tmux, so optimizing that feedback cycle can add up to many seconds saved. And what can I do with all the saved, you ask? [Ask Kevin.](https://www.youtube.com/watch?v=_K-L9uhsBLM)

![Time is money](https://media.giphy.com/media/e4uG83tGjWDiE/giphy.gif){: .center-image }

