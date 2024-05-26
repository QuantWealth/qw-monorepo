import { makeBatching } from './poller';
import { bootstrap } from './server';

const setup = async () => {
  // initiate the DB
  // initiate the batching poller
  makeBatching();
  // initiate the server
  bootstrap();
};

setup().catch((error) => {
  console.error('Error setting up Atlas', error);
  process.exit(1);
});
