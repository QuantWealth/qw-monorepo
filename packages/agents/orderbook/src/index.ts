import {connectOrderbookDB} from "qw-orderbook-db";
import { bootstrap } from './server';
import { loadConfig } from './config';
import { startPolling } from './poller';

// Setup the server
const setup = async () => {
  // Load the configuration
  const config = loadConfig();

  // Initialize the server
  bootstrap();

  // Start the polling loop if handleExecutions is true
  if (config.handleExecutions) {
    startPolling();
  }
};

setup().catch((error) => {
  console.error('Error setting up Orderbook server.', error);
  process.exit(1);
});


const setupDatabase = async () => {
  // Setup the database
  // ...

  const database = connectOrderbookDB();
}