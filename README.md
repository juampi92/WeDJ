WeDJ
====

Smart playlist player for your Local Network.

Launch the server on the machine that's connected to the speakers, and let people that are connected to your Local Network create a playlist based on the music that is on your computer.

Install
==================
To install this project you'll need [**Node.js**](http://nodejs.org/) and [**npm**](https://www.npmjs.org/) to install dependencies.
Run to install:

	npm install
Besides from node.js, this app needs

	mpg123
Which can be downloaded from [**the website**](http://www.mpg123.de/download.shtml).
Put the binary, if using windows, in the same folder as the proyect.

Dependencies
==================

This proyect uses this node.js packages:
  * [**Express**](http://expressjs.com/guide.html)
  * [**Jade**](http://jade-lang.com/)
  * [**Colors**](https://www.npmjs.org/package/colors)
  * [**Socket.io**](http://socket.io/)
  * [**Underscore**](http://underscorejs.org/)
  * [**Auto-Updater**](https://github.com/juampi92/auto-updater)

The web app uses:
  * [**Bootstrap**](http://getbootstrap.com/)

Basic Use
==================

On the first run, you'll have to specify a path to your music. There can be many, but the minimum is one.

	addlib <path to folder>

To force the creation of the files index use:

	analyze

Now you can start queueing files to the playlist.

To learn everything about the commands available:

	help

To-Do
==================
 * Smart Playlist (voting songs in playlist to re-arrange them)
 * About Tab
 * ID3
 * Dabatase (sqlite3 ?) for file search
 * Design problems (bigger for smartphones, no send button in chat, fix enter bug logging in)

Contact
==================
 * GitHub: [github.com/juampi92](https://github.com/juampi92)
 * Twitter: [@Juampi_92](https://twitter.com/Juampi_92)
