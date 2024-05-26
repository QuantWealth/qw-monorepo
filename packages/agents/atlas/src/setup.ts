import { makePipeline } from './pipeline';
import { bootstrap } from './server';

const setup = async () => {
  makePipeline();
  bootstrap();
};

setup().catch((error) => {
  console.error('Error setting up Atlas', error);
  process.exit(1);
});
