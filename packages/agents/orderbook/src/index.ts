import { bootstrap } from './server';

const setup = async () => {
  // initiate the server
  bootstrap();
};

setup().catch((error) => {
  console.error('Error setting up Orderbook server.', error);
  process.exit(1);
});
