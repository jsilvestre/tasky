# Description

Tasky is a simple yet powerful task manager. I found the usual tree structure to organize tasks far too rigid, so I came up with the idea that you can build your own tree on the fly with tags.


# Development

Clone this repository, install dependencies and run server (it requires Node.js)

    npm install -g coffee-script brunch nodemon
    git clone git://github.com/jsilvestre/tasky.git
    cd tasky
    npm install
    cd client/
    npm install
    brunch w &
    cd ..
    nodemon server.coffee --ignore client

# Contributing
Let me know what you would like to see in the application so we can discuss it. The simplest way to do it is [opening an issue](https://github.com/jsilvestre/tasky/issues/new).

Make sure there is not already an issue discussing the feature or the bug you are about to post about!

# Contributors
* @bnjbvr for the code, precious feedback and ideas machinegun
* @benibur for the thinking on the dynamic tree based on tags
* @frankrousseau for the feedback and ideas

# About Cozy

This app is suited to be deployed on the Cozy platform. Cozy is the personal
server for everyone. It allows you to install your every day web applications
easily on your server, a single place you control. This means you can manage
efficiently your data while protecting your privacy without technical skills.

More informations and hosting services on:
http://cozycloud.cc

# Cozy on IRC
Feel free to check out our IRC channel (#cozycloud at freenode.net) if you have any technical issues/inquiries or simply to speak about Cozy cloud in general.
