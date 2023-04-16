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

import { engine } from 'express-handlebars';


import EnvVars from './constants/EnvVars.js';
import HttpStatusCodes from './constants/HttpStatusCodes.js';

import { NodeEnvs } from './constants/misc.js';
import { GameSession, Player } from './GameSession.js';
import expressWs from 'express-ws';



// **** Variables **** //

const gorillas = new Map<string, GameSession>();
const app = expressWs(express()).app;


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
  
  const p1cookie = crypto.randomUUID();

  const s = new GameSession();
  s.oid = id;

  const p = new Player();
  p.cookie = p1cookie;
  s.player1 = p;

  s.runGame();
  gorillas.set(id, s);

  res.cookie('player', p1cookie);
  res.redirect(id);
});

app.get('/:world', (req, res, next) => {
  res.render('gorillas', {'layout':false});
});

app.ws('/:world', (ws, req, next) => {

  console.log(req.cookies);

  ws.on('message', (data) => {

  });
});

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
export default app;
