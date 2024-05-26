import { makeBatching } from './poller';
import { bootstrap } from './server';

const setup = async () => {
  makeBatching();
  bootstrap();
};

setup().catch((error) => {
  console.error('Error setting up Atlas', error);
  process.exit(1);
});
