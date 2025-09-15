import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function loader(app) {
  const routesDir = path.join(__dirname, '../routes');
  const files = fs.readdirSync(routesDir);

  for (const file of files) {
    if (file.endsWith('.js')) {
      const routeModule = await import(pathToFileURL(path.join(routesDir, file)).href);
      app.use('/api/v1/', routeModule.default); // Make sure route file uses `export default router`
    }
  }
}
