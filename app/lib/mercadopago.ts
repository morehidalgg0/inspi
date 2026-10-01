import { MercadoPagoConfig } from 'mercadopago';

/**
 * Datos del producto. Fuente única de verdad: el precio también se usa en la
 * landing, así que si lo cambiás acá hay que actualizarlo en app/page.tsx.
 */
export const EBOOK = {
  id: 'ebook-idea-ingresos',
  title: 'De la Idea a los Ingresos + 4 Bonos',
  description:
    'Ebook digital con 4 bonuses: checklist de validación, plantilla de precios, banco de 30 ideas validadas y comunidad privada.',
  quantity: 1,
  unitPrice: 19900,
  currencyId: 'ARS',
  statementDescriptor: 'DE LA IDEA A INGRESOS', // maximo 22 caracteres en MP
} as const;

/**
 * URL base del sitio, sin slash final.
 *
 * En producción Mercado Pago rechaza back_urls y notification_url con http://
 * o con localhost, por eso el valor tiene que venir del entorno y no estar
 * hardcodeado.
 *
 * Si SITE_URL no esta definido se cae al host de la request. Eso evita tener
 * que conocer el dominio antes del primer deploy en Vercel.
 */
export function getSiteUrl(request?: Request): string {
  const configured = process.env.SITE_URL?.trim();

  if (configured) return configured.replace(/\/+$/, '');

  const forwardedHost = request?.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost ?? request?.headers.get('host')?.trim();

  if (host) return `https://${host}`;

  throw new Error(
    'Falta configurar SITE_URL con la URL pública del sitio (ej. https://tudominio.com).',
  );
}

/**
 * Mercado Pago rechaza auto_return cuando back_urls no es una URL publica
 * (rechaza http://, localhost y 127.0.0.1). En desarrollo hay que omitirlo.
 */
export function isPublicSiteUrl(siteUrl: string): boolean {
  return !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)(:\d+)?/i.test(siteUrl);
}

export function getAccessToken(): string {
  const accessToken = process.env.MP_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    throw new Error('Falta configurar MP_ACCESS_TOKEN con el Access Token de Mercado Pago.');
  }

  return accessToken;
}

export function getWebhookSecret(): string {
  const secret = process.env.MP_WEBHOOK_SECRET?.trim();

  if (!secret) {
    throw new Error('Falta configurar MP_WEBHOOK_SECRET (lo encontrás en Tus Integraciones).');
  }

  return secret;
}

/**
 * En modo prueba Mercado Pago exige que el email del comprador sea el de un
 * usuario de prueba (@testuser.com). Si el comprador escribe su email real,
 * el checkout se cae al confirmar con "una de las partes es de prueba".
 * Precargarlo en la preferencia evita ese error.
 *
 * En produccion se deja vacio: no hay que forzar ningun email.
 */
export function getTestPayerEmail(): string | undefined {
  return process.env.MP_TEST_PAYER_EMAIL?.trim() || undefined;
}

/**
 * Crea el cliente de la API de Mercado Pago.
 *
 * No hace falta ningún flag de sandbox: Mercado Pago deduce el entorno a partir
 * del token. Un token de test siempre devuelve init_point de test, y uno
 * productivo devuelve el de producción.
 */
export function createMpClient(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: getAccessToken() });
}

/**
 * Detecta si el token es de pruebas.
 *
 * No se puede deducir del prefijo: los usuarios de prueba de Mercado Pago
 * también usan tokens APP_USR-. La unica fuente fiable es el usuario al que
 * apunta el token.
 */
let sandboxCache: boolean | null = null;

export async function isSandboxToken(): Promise<boolean> {
  if (sandboxCache !== null) return sandboxCache;

  try {
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });

    if (!response.ok) return false;

    const user = (await response.json()) as { nickname?: string; email?: string };
    sandboxCache =
      /^TESTUSER/i.test(user.nickname ?? '') || /@testuser\.com$/i.test(user.email ?? '');

    if (sandboxCache) {
      console.warn(
        `[MP] El MP_ACCESS_TOKEN es de PRUEBAS (${user.nickname}). Los pagos no son reales.`,
      );
    }
  } catch {
    // Este chequeo es informativo: si falla la API no debe romper el checkout.
    return false;
  }

  return sandboxCache;
}