
import logger from 'jet-logger';

import EnvVars from "./constants/EnvVars.js"
import server from './server.js';


// **** Run **** //

const SERVER_START_MSG = ('Express server started on port: ' + 
  EnvVars.Port.toString());

server.listen(EnvVars.Port, () => logger.default.info(SERVER_START_MSG));
