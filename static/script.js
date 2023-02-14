
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

function updateScreen(track) {
    const currentYear = document.getElementById("current_year");
    const currentTitle = document.getElementById("current_title");
    const currentArtist = document.getElementById("current_artist");

    // currentYear.innerHTML = track.year;
    // currentTitle.innerHTML = track.title;
    // currentArtist.innerHTML = track.artist;

    animatedUpdate(currentYear, track.year);
    animatedUpdate(currentTitle, track.title);
    animatedUpdate(currentArtist, track.artist);
}

async function animatedUpdate(element, newText) {
    const random = Math.floor(Math.random() * (animations.length - 0 + 1)) + 0;
    const animation = animations[random];

    console.log(`Random Animation num ${random}: ${animation}`);

    await animateCSS(element, "fadeOut");
    element.innerHTML = newText;
    await animateCSS(element, animation);
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = element

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
  });
