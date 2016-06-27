---
layout: post
title:  "AWS Key and Secret with special characters"
date:   2015-07-03 12:23:41 +0800
categories: bug,aws
comments: true
---
When playing around with file uploads using the gem paperclip from a heroku rails app ([I did as described here](https://devcenter.heroku.com/articles/paperclip-s3)), I got it working from my local environment, successfully uploading images to my bucket. But upon pushing to heroku production, the key and secret seems to have issues and I was given this:

````
AWS::S3::Errors::SignatureDoesNotMatch (The request signature we calculated does not match the signature you provided.
````
I tripple checked that there were no difference in the config variables and inspected the configured AWS credentials on production and all seemed to tally up.

Then I found [this post that gave me some direction](http://stackoverflow.com/questions/2777078/amazon-mws-request-signature-calculated-does-not-match-the-signature-provided). Many solved by the trailing slashs and encoding of "+" and stuff in the credentials. I went ahead to the AWS console and kept refreshing till I get an all alpha-numeric key and secret pair. I got it after about 5 rounds of create-and-delete cycles. Magically the upload succeeds at first try.

I'll never be sure that it's heroku's environment messing up the encoding special characters, but now it works and I'll keep using the alpha-numeric-only key.
