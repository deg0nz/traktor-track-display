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

const colorThemes = [
    "purple-yellow",
    "black-red",
    "orange-blue",
    "orange-blue-inverted",
    "blue-pink",
    "blue-pink-inverted",
    "cyan-pink",
    "fuchsia-pink",
    "pink-purple-gradient"
];

const ws = new WebSocket(`ws://${window.location.host}/ws`);
let currentTrack = null;

ws.addEventListener("open", () => {
    console.log("WebSocket connected");

    ws.send("Client Hello");
});

ws.addEventListener("message", (message) => {
    const track = JSON.parse(message.data);

    console.log("Got message");
    console.log(track);

    if (currentTrack && currentTrack.title === track.title) {
        return;
    } else {
        currentTrack = JSON.parse(JSON.stringify(track));
    }

    updateScreen(track);
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function updateScreen(track) {
    const currentYear = document.getElementById("current_year");
    const currentTitle = document.getElementById("current_title");
    const currentArtist = document.getElementById("current_artist");

    // currentYear.innerHTML = track.year;
    // currentTitle.innerHTML = track.title;
    // currentArtist.innerHTML = track.artist;

    const randomThemeNum = getRandomInt(0, colorThemes.length);
    const theme = colorThemes[randomThemeNum];
    const body = document.body;

    await animateCSS(body, "fadeOut");
    body.classList = theme;
    currentYear.innerHTML = "";
    currentTitle.innerHTML = "";
    currentArtist.innerHTML = "";
    await animateCSS(body, "fadeIn");

    animatedUpdate(currentYear, track.year);
    animatedUpdate(currentTitle, track.title);
    animatedUpdate(currentArtist, track.artist);
}

async function animatedUpdate(element, newText) {
    const randomAnimationNum = getRandomInt(0, animations.length);
    const animation = animations[randomAnimationNum];

    console.log(`Random Animation num ${randomAnimationNum}: ${animation}`);

    // await animateCSS(element, "fadeOut");
    element.innerHTML = newText;
    await animateCSS(element, animation);
}

const animateCSS = (element, animation, prefix = "animate__") =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = element;

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve("Animation ended");
        }

        node.addEventListener("animationend", handleAnimationEnd, { once: true });
    });
