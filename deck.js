class Deck {
    constructor(id, title, artist, year) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.year = year;

        this.isPlaying = false;
    }

    setTitle(title) {
        this.title = title;
    }

    setArtist(artist) {
        this.artist = artist;
    }

    setYear(year) {
        this.year = year;
    }

    updateData(title, artist, year) {
        this.setTitle(title);
        this.setArtist(artist);
        this.setYear(year);
    }
}

module.exports = Deck;