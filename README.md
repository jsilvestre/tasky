# Description
Tasky is a simple yet powerful task manager. I found the usual tree structure to organize tasks far too rigid, so I came up with the idea that you can build your own tree on the fly with tags.

# Ownership / Maintainership

I'm not updating the application lately, and don't intend to do so in the next months. I would happily give the ownership/maintainership of the repository to anyone willing to take it over.

[Let me know if you are interested](https://github.com/jsilvestre/tasky/issues/48)!


# Development
Clone this repository, install dependencies and run server (it requires Node.js)

    git clone git://github.com/jsilvestre/tasky.git
    cd tasky
    npm install
    npm run dev # start everything you need

**DISCLAMER**
Dear Windows users, the build system assume that you can run the following UNIX commands:

* cat
* cp
* rm
* sed
* touch
* mkdir

If you have any trouble finding a solution, let me know you are interested, so we can look into it together.

## Useful resources
Tasky is not built on a monolithic framework, but rather on multiple smaller libraries. While it comes with a bunch advantages, the drawback is that you need to check multiple documentations to understand what is going on. Here they are:

* [React JS](https://facebook.github.io/react/) is for the view.
* [Redux](http://rackt.org/redux/docs/api/) (which act as a sort of Controller).
    * `actions` are triggered by user inputs.
    * `reducers` change the app's state based on `actions`.
    * `selectors` maps the app's state so it can be displayed.
* Routing is done thanks to [url-pattern](https://www.npmjs.com/package/url-pattern) and [history](https://github.com/rackt/history).
* [superagent](https://github.com/visionmedia/superagent) is used for all HTTP interactions.

# Contributing
Let me know what you would like to see in the application so we can discuss it. The simplest way to do it is [opening an issue](https://github.com/jsilvestre/tasky/issues/new).

Make sure there is not already an issue discussing the feature or the bug you are about to post about!

# Contributors
* @bnjbvr for the code, precious feedbacks and ideas machine-gun.
* @benibur for the thoughts on the dynamic tree based on tags.
* @frankrousseau for the feedback and ideas.
* @nicofrand for all the issues opened and the follow up!

# What is Cozy?

![Cozy Logo](https://raw.github.com/mycozycloud/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you
with a new experience. You can install Cozy on your own hardware where no one
profiles you. You install only the applications you want. You can build your
own one too.

## Community

You can reach the Cozy community via various channels:

* IRC #cozycloud on irc.freenode.net
* Post on our [Forum](https://forum.cozy.io/)
* Post issues on the [Github repos](https://github.com/cozy/)
* [Twitter](http://twitter.com/mycozycloud)
