import app from './express.js';
import loader from './loader.js';

await loader(app); // Dynamically loads routes, etc.

export default app;