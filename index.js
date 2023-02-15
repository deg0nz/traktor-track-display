const Koa = require("koa");
const Router = require("koa-router");
const koaBody = require("koa-body").default;
const serve = require("koa-static");
const websockify = require("koa-websocket");
const path = require("path");
const Deck = require("./deck");

const app = websockify(new Koa());
const wsRouter = new Router();
const router = new Router();
const wsClients = [];

const TIMECODE_MODE = true;

/////////////////////////////////////////////////////////
//
//  What is currently playing logic
//
/////////////////////////////////////////////////////////

// Placeholders for new Clients (in case of refresh)
let currentTrack = null;
const decks = new Map();

function handleDeckLoaded(data) {
    console.log(data);

    const deckId = data.deckId;
    if (!decks.has(deckId)) {
        console.log(`Adding deck ${deckId} to decks pool.`);
        decks.set(deckId, new Deck(deckId));
    }

    const track = data.track;
    const deck = decks.get(deckId);
    deck.updateData(track.title, track.artist, track.comment);

    if (TIMECODE_MODE === true) {
        deck.isPlaying = true;
    }

    if (currentTrack === null) {
        currentTrack = deck;
    }
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
        notifyClients(currentTrack);
        // nextTrack = b
    } else if (b.isPlaying) {
        console.log("B is playing");

        currentTrack = b;
        notifyClients(currentTrack);
        // nextTrack = a;
    }

    return true;
}

function handleUpdateDeck(data) {
    console.log(data);

    const deckInfo = data.deckInfo;
    const deck = decks.get(data.deckId);

    if (typeof deck !== "undefined" && typeof deckInfo.isPlaying !== "undefined") {
        deck.isPlaying = deckInfo.isPlaying;
    }

    if (typeof deck !== "undefined" && typeof deckInfo.tempo !== "undefined") {
        if (deckInfo.tempo === 0) {
            deck.isPlaying = false;
        } else {
            deck.isPlaying = true;
        }
    }
}

/////////////////////////////////////////////////////////
//
//  Webserver
//
/////////////////////////////////////////////////////////

/// WebSocket ///

wsRouter.use((ctx, next) => {
    // return `next` to pass the context (ctx) on to the next ws middleware
    return next(ctx);
});

wsRouter.get("/ws", async (ctx, next) => {
    console.log("New Websocket client!");

    const ws = ctx.websocket;

    ws.on("message", (message) => {
        const msgText = message.toString();
        console.log(`Got WS message: ${msgText}`);

        if (msgText === "Client Hello" && currentTrack !== null) {
            const payload = JSON.stringify(currentTrack);
            console.log("Sending current track");
            console.log(payload);
            ws.send(payload);
        }
    });

    ws.on("error", (err) => {
        console.log(err);
    });

    wsClients.push(ws);

    console.log(`Num clients: ${wsClients.length}`);
    return next;
});

function notifyClients(message) {
    wsClients.forEach((websocket) => {
        websocket.send(JSON.stringify(message));
    });
}

/// API ///

router.post("/deckLoaded/:deck", async (ctx) => {
    try {
        const deck = ctx.params.deck;

        // console.log("==========================================================")
        console.log(`/deckLoaded/${deck}`);
        // console.log("==========================================================")

        ctx.body = {
            error: false,
            type: "deckLoaded",
            deckId: deck,
            track: ctx.request.body,
        };

        // console.log(JSON.stringify(ctx.body));

        handleDeckLoaded(ctx.body);
    } catch (e) {
        ctx.status = 400;
        ctx.body = {
            error: "CANNOT_PARSE",
        };
    }
});

router.post("/updateDeck/:deck", async (ctx) => {
    try {
        const deck = ctx.params.deck;

        // console.log("==========================================================")
        console.log(`/updateDeck/${deck}`);
        // console.log("==========================================================")
        // console.log(ctx.request.body);
        // console.log(JSON.stringify(ctx.request));

        ctx.body = {
            error: false,
            type: "updateDeck",
            deckId: deck,
            deckInfo: ctx.request.body,
        };

        // currentUpdateDeck = ctx.body;
        handleUpdateDeck(ctx.body);

        updateCurrentTrack();
    } catch (e) {
        ctx.status = 400;
        ctx.body = {
            error: "CANNOT_PARSE",
        };
    }
});

// router.post('/updateMasterClock', async (ctx, next) => {
//   try {
//     console.log("==========================================================")
//     console.log("/updateMasterClock");
//     console.log("==========================================================")
//     console.log(ctx.body);

//     ctx.body = {
//       error: false,
//       parsed: ctx.request.body
//     };

//   } catch (e) {
//     ctx.status = 400;
//     ctx.body = {
//       error: 'CANNOT_PARSE'
//     };
//   }

// //   return next;
// });

// router.post('/updateChannel/:channel', async (ctx, next) => {
//   try {
//     console.log("==========================================================")
//     console.log(`/updateChannel/${ctx.params.channel}`);
//     console.log("==========================================================")

//     ctx.body = {
//       error: false,
//       parsed: ctx.request.body
//     };

//     console.log(ctx.body);
//   } catch (e) {
//     ctx.status = 400;
//     ctx.body = {
//       error: 'CANNOT_PARSE'
//     };
//   }
// });

app.use(koaBody());
app.ws.use(wsRouter.routes()).use(wsRouter.allowedMethods());
app.use(router.routes());
app.use(serve(path.join(__dirname, "/static")));

app.listen(8080);
