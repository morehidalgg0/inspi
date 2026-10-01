/**
 * Firma y envia una notificacion igual que Mercado Pago, contra una URL local.
 *
 * Uso:
 *   node scripts/test-webhook.mjs http://localhost:3000 123456
 *
 * MP firma como: HMAC-SHA256(manifest "id:{dataId};request-id:{xRequestId};ts:{ts}", secret)
 * y manda el resultado en x-signature como "ts={ts},v1={hmac}".
 */
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';

const baseUrl = process.argv[2] ?? 'http://localhost:3000';
const dataId = process.argv[3] ?? '123456';

const secret = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n')
  .find((line) => line.startsWith('MP_WEBHOOK_SECRET='))
  ?.split('=')
  .slice(1)
  .join('=')
  .trim()
  .replace(/^["']|["']$/g, '');

if (!secret) {
  console.error('Falta MP_WEBHOOK_SECRET en .env.local');
  process.exit(1);
}

const payload = {
  action: 'payment.updated',
  api_version: 'v1',
  data: { id: dataId },
  date_created: new Date().toISOString(),
  id: String(dataId),
  live_mode: false,
  type: 'payment',
  user_id: 3187539096,
};

const body = JSON.stringify(payload);
const xRequestId = crypto.randomUUID();
const ts = Math.floor(Date.now() / 1000).toString();

const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
const hmac = createHmac('sha256', secret).update(manifest).digest('hex');

const response = await fetch(`${baseUrl}/api/webhooks/mercadopago`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-signature': `ts=${ts},v1=${hmac}`,
    'x-request-id': xRequestId,
  },
  body,
});

console.log(`POST ${baseUrl}/api/webhooks/mercadopago`);
console.log(`  data.id: ${dataId}`);
console.log(`  firma:   ${hmac.slice(0, 16)}...`);
console.log(`\nHTTP ${response.status}`);
console.log(await response.text());