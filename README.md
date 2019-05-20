# Self Driving Car Game
This is a silly project I put together to experiment with Neural Networks. Almost all of it is copied and pasted from some random source on the internet that I haven't yet collected links of yet. It is very hacky with bad architecture, but it didn't start as a serious project. I'm currently considering turning this into a full fledged game where separate teams can all compete to make the best network and can draw their own courses, etc. Then an official competition would be held with a never-before-seen map made by me that you must compete with others against. How you train your car is up to you. Ideally, I'd like to prototype the game fully, then do a complete rewrite for a better architecture.

Currently, there is a built in map. If you edit the source, you can figure out how to enable the edit mode and generate your own track.You can save/load the network you generate, and it will try to run with some level of concurrency.

## Installation
Just clone the repo and `npm install`.

## Commands

- `gulp build` - Run the main project build (JS bundling, Sass compilation).
- `gulp serve` - Start up a [browser sync](http://browsersync.io) server and watch for changes.
