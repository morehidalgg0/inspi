/**
 * Sube el ebook a Vercel Blob y deja la URL en .env.local como EBOOK_DOWNLOAD_URL.
 *
 *   node scripts/upload-ebook.mjs
 *
 * Requiere BLOB_READ_WRITE_TOKEN (se genera en Vercel > Storage > Blob).
 * El token queda en el proyecto para que el servidor pueda borrar o reemplazar
 * el archivo, pero la URL publica por si sola no sirve para descargar.
 */
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const sourcePath = path.join(projectRoot, 'assets', 'ebook.zip');
const envPath = path.join(projectRoot, '.env.local');

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Falta BLOB_READ_WRITE_TOKEN. Configuralo en .env.local y en Vercel.');
  process.exit(1);
}

const file = await fs.readFile(sourcePath);
const megabytes = (file.length / 1024 / 1024).toFixed(1);
console.log(`Subiendo assets/ebook.zip (${megabytes} MB)...`);

const { url, downloadUrl } = await put('ebook/ebook.zip', file, {
  access: 'public',
  addRandomSuffix: false,
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

console.log(`Subido. downloadUrl: ${downloadUrl}`);

let env = await fs.readFile(envPath, 'utf8').catch(() => '');
const line = `EBOOK_DOWNLOAD_URL="${downloadUrl}"`;

if (/^EBOOK_DOWNLOAD_URL=.*$/m.test(env)) {
  env = env.replace(/^EBOOK_DOWNLOAD_URL=.*$/m, line);
} else {
  env = env.replace(/\s*$/, '\n') + line + '\n';
}

await fs.writeFile(envPath, env);
console.log(`EBOOK_DOWNLOAD_URL guardada en ${envPath}`);