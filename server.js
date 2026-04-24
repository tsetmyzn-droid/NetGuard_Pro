import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Try to find the Flutter web build in standard locations
let staticPath = join(__dirname, 'build/web');
if (!fs.existsSync(staticPath)) {
  staticPath = __dirname; // Fallback to root
}

console.log(`Serving static files from: ${staticPath}`);

app.use(express.static(staticPath));

// Don't serve index.html for missing static assets (images, js, css)
app.get(/\.(js|css|png|jpg|jpeg|gif|ico|svg|json)$/, (req, res) => {
  res.status(404).send('Not Found');
});

app.get('*', (req, res) => {
  const indexPath = join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
