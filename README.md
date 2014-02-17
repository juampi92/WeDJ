WeDJ
====

Smart playlist player for your Local Network.

Launch the server on the machine that connected to the audio device, and let people that are connected to your Local Network create a playlist based on the music that is on your computer.

Install
==================
To install this project you'll need [**Node.js**](http://nodejs.org/) and [**npm**](https://www.npmjs.org/) to install dependencies.
Run to install:

	npm install
Besides from node.js, this app needs

	mpg123
Which can be downloaded from [**the website**](http://www.mpg123.de/download.shtml).
Put the binary, if using windows, in the same folder as the proyect.

Uses
==================

This proyect uses this node.js packages:
  * [**Express**](http://expressjs.com/guide.html)
  * [**Jade**](http://jade-lang.com/)
  * [**Colors**](https://www.npmjs.org/package/colors)
  * [**Socket.io**](http://socket.io/)
  * [**Underscore**](http://underscorejs.org/)

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
 * Smart Playlist
 * Admin Panel
 * About Tab
 * Vote Playlist
 * ID3
 * Dabatase (sqlite3 ?)

Contact
==================
 * GitHub: [github.com/juampi92](https://github.com/juampi92)
 * Mail: <juampi92@gmail.com>
