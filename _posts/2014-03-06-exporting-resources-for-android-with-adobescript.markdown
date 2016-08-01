---
layout: post
title:  "Export resources for Android with AdobeScript"
date:   2014-03-06 14:40:41 +0800
categories: automate
comments: true
---
In my learning journey as an Android developer, one annoying task is to export a graphic resource multiple times for the handful of screen resolutions that I want to support: mdpi, hdpi, xhdpi and now xxhdpi. This task involves a repeated set of mouse clicks, a change in scaling value, and navigating to the right folders for the right dpi. It can get quite tedious, especially when I often have multiple images for one button, and a gazillion edits before I'm happy with how it looks.

This calls for some scripting for the awesomeness of automation. There's something magical about automatic processes that fascinates me. So I wrote [this Adobe Script in this gist,](https://gist.github.com/keang/8701058) which has saved myself uncountable mouse clicks and hair pullings.

I remember clearly the joy of running the script and watching the res/drawable/ subfolders be populated with the awesome crisp graphics that I just made. Visually witnessing the .png's popping up is magical, but knowing that you've created that magic is even more... _"magicaller"_.

I'll probably visit this again and add in the dimensions for iOS resources as well when I get my hands on a Mac and have some time to learn iOS too.
