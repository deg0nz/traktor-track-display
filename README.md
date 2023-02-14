# Traktor Track Display Webserver

This is a quick and dirty fun project I made for a friend's birthday. He made a playlist with 1 song from the top 100 charts of every year he lived. This project was supposed to be a nice gimmick for the party while mixing the playlist with Traktor.

It is meant to be used with [`traktor-api-client`](https://github.com/ErikMinekus/traktor-api-client) as data source.

The website shows year, title and artist in big letters. The screen is updated when only one song is playing on Traktor decks A or B.

*Please note:* Since Traktor does not expose the release date metadata of a track via QML, the year of a song is read from the `comment` property of a track (from the ID3 Tag), hence it must be added to a song manually via Traktor or mp3 tag editor.