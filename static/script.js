//TODO: // Track handling ins backend und nur Updates hierher senden /////


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

const animations = [
    "bounce",
    "flash",
    "pulse",
    "rubberBand",
    "shakeX",
    "shakeY",
    "headShake",
    "swing",
    "tada",
    "wobble",
    "jello",
    "heartBeat",
    "backInDown",
    "backInLeft",
    "backInRight",
    "backInUp",
    "bounceIn",
    "bounceInDown",
    "bounceInLeft",
    "bounceInRight",
    "bounceInUp",
    "fadeIn",
    "fadeInDown",
    "fadeInDownBig",
    "fadeInLeft",
    "fadeInLeftBig",
    "fadeInRight",
    "fadeInRightBig",
    "fadeInUp",
    "fadeInUpBig",
    "fadeInTopLeft",
    "fadeInTopRight",
    "fadeInBottomLeft",
    "fadeInBottomRight",
    "lightSpeedInRight",
    "lightSpeedInLeft",
    "flip",
    "jackInTheBox",
    "rollIn",
];

const decks = new Map();
const ws = new WebSocket(`ws://${window.location.host}/ws`);
let currentTrack = null;
// let nextTrack = null;

ws.addEventListener("open", () => {
    console.log("WebSocket connected");

    ws.send("Client Hello");
});

ws.addEventListener("message", (message) => {
    const data = JSON.parse(message.data);

    console.log("Got message");
    console.log(message.data);

    if (data.type === "deckLoaded") {
        handleDeckLoaded(data);
    }

    if (data.type === "updateDeck") {
        handleUpdateDeck(data);
    }

    updateScreen();
});

function handleDeckLoaded(data) {
    console.log(data);

    const deckId = data.deck;
    if (!decks.has(deckId)) {
        decks.set(deckId, new Deck(deckId));
    }

    const track = data.track;
    const deck = decks.get(deckId);
    deck.updateData(track.title, track.artist, track.comment);

    if (currentTrack === null) {
        currentTrack = deck;
    }

    // if (currentTrack && deck.id !== currentTrack.id) {
    //     nextTrack = deck;
    // }
}


function updateCurrentTrack() {
    // Only Decks A and B are supported for now
    const a = decks.get("A");
    const b = decks.get("B");

    if (!a || !b) return false;

    if (a.isPlaying && b.isPlaying) {
        console.log("Both are playing");

        return false;
    } else if (a.isPlaying) {
        console.log("A is playing");

        currentTrack = a;
        // nextTrack = b
    } else if (b.isPlaying) {
        console.log("B is playing");

        currentTrack = b;
        // nextTrack = a;
    }

    return true;
}

async function updateScreen() {
    updateCurrentTrack();

    const currentYear = document.getElementById("current_year");
    const currentTitle = document.getElementById("current_title");
    const currentArtist = document.getElementById("current_artist");

    currentYear.innerHTML = currentTrack.year;
    currentTitle.innerHTML = currentTrack.title;
    currentArtist.innerHTML = currentTrack.artist;

    // await animatedUpdate(currentYear, currentTrack.year);
}

async function animatedUpdate(element, newText) {
    const random = Math.random() * (animations.length - 0);
    const animation = animations[random];

    await animateCSS(element, "fadeOut");
    element.innerHTML = newText;
    await animateCSS(element, animation);
}

const animateCSS = async (element, animation, prefix = "animate__") => {
    // We create a Promise and return it
    return new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = document.querySelector(element);

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve("Animation ended");
        }

        node.addEventListener("animationend", handleAnimationEnd, { once: true });
    });
};

function handleUpdateDeck(data) {
    console.log(data);

    const deckInfo = data.deckInfo;
    const deck = decks.get(data.deck);

    if (typeof deck !== "undefined" && typeof deckInfo.isPlaying !== "undefined") {
        deck.isPlaying = deckInfo.isPlaying;
    }
}
