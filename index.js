const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body').default;
const serve = require('koa-static');
const websockify = require('koa-websocket');
// const WebSocket = require('ws');
const path = require('path')

const app = websockify(new Koa());
// const app = new Koa();

const wsRouter = new Router();
const router = new Router();

const wsClients = [];

wsRouter.use((ctx, next) => {
  // return `next` to pass the context (ctx) on to the next ws middleware
  return next(ctx);
});

wsRouter.get('/ws', async (ctx, next) => {
    console.log("New Websocket client!");

    const ws = ctx.websocket;

    ws.on('message', (message) => {
        console.log(`Got WS message: ${message.toString()}`);
    });

    ws.on('error', (err) => {
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

router.post('/deckLoaded/:deck', async (ctx) => {
  try {
    const deck = ctx.params.deck;

    console.log("==========================================================")
    console.log(`/deckLoaded/${deck}`)
    console.log("==========================================================")
    
    ctx.body = {
      error: false,
      type: "deckLoaded",
      deck: deck,
      track: ctx.request.body
    };

    console.log(JSON.stringify(ctx.body));

    notifyClients(ctx.body);

  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      error: 'CANNOT_PARSE'
    };
  }
});

router.post('/updateDeck/:deck', async (ctx) => {
  try {
    const deck = ctx.params.deck;

    console.log("==========================================================")
    console.log(`/updateDeck/${deck}`)
    console.log("==========================================================")
    console.log(ctx.request.body);
    console.log(JSON.stringify(ctx.request));

    ctx.body = {
      error: false,
      type: "updateDeck",
      deck: deck,
      deckInfo: ctx.request.body
    };

    notifyClients(ctx.body);

  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      error: 'CANNOT_PARSE'
    };
  }
});

router.post('/updateMasterClock', async (ctx, next) => {
  try {
    console.log("==========================================================")
    console.log("/updateMasterClock");
    console.log("==========================================================")
    console.log(ctx.body);

    ctx.body = {
      error: false,
      parsed: ctx.request.body
    };

  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      error: 'CANNOT_PARSE'
    };
  }

//   return next;
});

router.post('/updateChannel/:channel', async (ctx, next) => {
  try {
    console.log("==========================================================")
    console.log(`/updateChannel/${ctx.params.channel}`);
    console.log("==========================================================")

    ctx.body = {
      error: false,
      parsed: ctx.request.body
    };

    console.log(ctx.body);
  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      error: 'CANNOT_PARSE'
    };
  }
});


app.use(koaBody());
app.ws.use(wsRouter.routes()).use(wsRouter.allowedMethods());
app.use(router.routes());
app.use(serve(path.join(__dirname, '/static')));

app.listen(8080);