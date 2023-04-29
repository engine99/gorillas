/**
 * Setup express server.
 */

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import crypto from 'node:crypto';
import 'express-async-errors';
import { Server } from 'http';

import { parse } from 'cookie';
import { engine } from 'express-handlebars';


import EnvVars from './constants/EnvVars.js';
import HttpStatusCodes from './constants/HttpStatusCodes.js';

import { NodeEnvs } from './constants/misc.js';
import { GameSession, Player } from './GameSession.js';
import { WebSocketServer } from 'ws';


// **** Variables **** //

const gorillas = new Map<string, GameSession>();
const app = express();
const server = new Server(app);
const wsapp = new WebSocketServer({server});


// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(EnvVars.CookieProps.Secret));

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

app.get('/gorilist',(req, res, next) => {
  res.write(Object.keys(gorillas));
});

app.get('/',(req, res, next) => {
  const id = crypto.randomUUID();
  
  const s = new GameSession();
  s.oid = id;

  gorillas.set(id, s);
  s.startGameAndStream();
  res.redirect(id);
});

app.get('/:world(\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}$)', (req, res, next) => {
  const w = req.params.world;
  const g = gorillas.get(w);
  if (!g) {
    throw "Strange world";
  }

  console.log("world"+req.params.world);
  console.log("cookie at world:"+req.headers.cookie);
  const playerCookie = req.headers.cookie?.match(/^player=\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  
  if (playerCookie && playerCookie[0] && g.players.find(x => x.cookie === playerCookie[0])) {
    console.debug("known player")!
  } else {
    console.debug("new player to this game " + req.params.world);
    const subsequentPlayerCookie = crypto.randomUUID();
    const p = new Player();
    p.cookie = subsequentPlayerCookie;
    g.players.push(p);
    res.cookie('player', subsequentPlayerCookie);
  }

  res.render('gorillas', {'layout':false});
});

wsapp.on('connection', (ws, req) => {
  
  let path = req.url;
  if (path?.match(/\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)) {
    let id = path.substring(1);
    let game = gorillas.get(id);
    if (game) {
      console.log("game exists:"+ path);
      console.log(req.headers['cookie']);

      if (!req.headers.cookie) {
        console.log("no cookie");
        return;
      }

      let pid = parse(req.headers.cookie).player;
      
      game.players.filter(s => s.cookie === pid).forEach((x) => {x.ws = ws});
      
      ws.on('message', (data, isBinary) => {
        let mess = data.toString().split(':');
        if (mess[0] === 'keydown') {
          let key = mess[1];
          if (key.match(/(Backspace|Enter|^[\w. ]$)/)) {
            game?.sendKeys(key);
          } else {
            console.log('Bad key ' + key);
          }
        }
      })

    } else {
      console.log("funny game id:"+ path);
    }
  } else {
    console.log("bad connection" + path);
  }
})

// Add error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test) {
    logger.default.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  return res.status(status).json({ error: err.message });
});


// ** Front-End Content ** //

// Set views directory (html)
app.set('views', 'src/views');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Set static directory (js and css).
app.use(express.static('public'));


// **** Export default **** //
export default server;
