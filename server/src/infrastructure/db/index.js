import config from '../../config/index.js';

let adapter;

switch (config.db.type) {
  case 'sqlite':
    adapter = await import('./sqlite.js');
    break;
  case 'mongo':
    adapter = await import('./mongo.js');
    break;
  case 'memory':
  default:
    adapter = await import('./memory.js');
    break;
}

export default adapter.default;
