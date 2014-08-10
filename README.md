WeDJ
====

Smart playlist player for your Local Network.

Launch the server on the machine that's connected to the speakers, and let people that are connected to your Local Network create a playlist based on the music that is on your computer.

Install
==================
To install this project you'll need [**Node.js**](http://nodejs.org/) and [**npm**](https://www.npmjs.org/) to install dependencies.
Run to install:

	npm install

And then install globally Grunt and do

	grunt compile

to generate the js, styles, and templates

Dependencies
==================

This proyect uses this node.js packages:
  * [**Express**](http://expressjs.com/)
  * [**Colors**](https://www.npmjs.org/package/colors)
  * [**Socket.io**](http://socket.io/)
  * [**Underscore**](http://underscorejs.org/)
  * [**Auto-Updater**](https://github.com/juampi92/auto-updater)
  * [**MusicMetadata**](https://github.com/leetreveil/musicmetadata)
  * [**NeDB**](https://github.com/louischatriot/nedb)

The web app uses:
  * [**jQuery**](http://jquery.com/)
  * [**Bootstrap**](http://getbootstrap.com/)

Dev packages:
  * [**Grunt**](http://gruntjs.com)
  * [**Jade**](http://jade-lang.com/)

Basic Use
==================

On the first run, you'll have to specify a path to your music. There can be many, but the minimum is one.

	addlib <path to folder>

To force the creation of the files index use:

	analyze

Now you can start queueing files to the playlist.

To learn everything about the commands available:

	help




If using WebPlayer, launch in your browser this page:

	localhost:3000/server

If not, you'll have to download (if windows)

	mpg123.exe

Which can be downloaded from [**it's website**](http://www.mpg123.de/download.shtml).
Put the binary, if using windows, in the same folder as the proyect.

To-Do
==================
 * Vote Playlist (already smart!)
 * About Tab
 * Add admins
 * Upload Files

 * UI improvements

 * Create a stable release branch

Known Bugs
==================
 * Next on admin options does not force you to login, so it does not work

Contact
==================
 * GitHub: [github.com/juampi92](https://github.com/juampi92)
 * Twitter: [@Juampi_92](https://twitter.com/Juampi_92)