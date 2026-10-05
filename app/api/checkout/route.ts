import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import {
  EBOOK,
  assertProductionSafe,
  createMpClient,
  getSiteUrl,
  getTestPayerEmail,
  isPublicSiteUrl,
  isSandboxToken,
} from '../../lib/mercadopago';

export async function POST(request: Request) {
  try {
    const siteUrl = getSiteUrl(request);
    const isPublic = isPublicSiteUrl(siteUrl);
    const testPayerEmail = getTestPayerEmail();

    const body = await request.json().catch(() => ({}));
    const customerEmail = typeof body.email === 'string' ? body.email.trim() : '';

    if (!customerEmail) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    await isSandboxToken();
    await assertProductionSafe();

    const preference = new Preference(createMpClient());

    // Referencia propia para poder conciliar cada compra con su pago mas tarde.
    const externalReference = crypto.randomUUID();

    const result = await preference.create({
      body: {
        items: [
          {
            id: EBOOK.id,
            title: EBOOK.title,
            description: EBOOK.description,
            quantity: EBOOK.quantity,
            unit_price: EBOOK.unitPrice,
            currency_id: EBOOK.currencyId,
          },
        ],
        back_urls: {
          success: `${siteUrl}/success`,
          failure: `${siteUrl}/failure`,
          pending: `${siteUrl}/pending`,
        },
        // auto_return exige URLs publicas: con localhost la API devuelve 400.
        ...(isPublic ? { auto_return: 'approved' } : {}),
        // En sandbox el email del comprador tiene que ser de un usuario de
        // prueba; precargarlo evita el rechazo "una de las partes es de prueba".
        // En produccion usa el email que el cliente ingresó en la landing.
        payer: { email: testPayerEmail || customerEmail },
        // MercadoPago ignora payer.email si el comprador esta logueado y usa el
        // de su cuenta. Guardamos el email ingressado en la landing aca porque
        // metadata si se copia tal cual al pago, y el webhook lo prioriza.
        metadata: { delivery_email: customerEmail },
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        external_reference: externalReference,
        statement_descriptor: EBOOK.statementDescriptor,
      },
    });

    if (!isPublic) {
      console.warn(
        `[MP] SITE_URL es local (${siteUrl}): se omite auto_return. El redirect post-pago va a fallar hasta que SITE_URL apunte al dominio real.`,
      );
    }

    const isSandbox = await isSandboxToken();
    const initPoint = isSandbox ? result.sandbox_init_point : result.init_point;

    console.log(
      `[MP] Preferencia ${result.id} creada para ${externalReference} -> ${initPoint ?? result.init_point}`,
    );

    return NextResponse.json({
      url: initPoint ?? result.init_point,
      preferenceId: result.id,
      externalReference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[MP] Error creando la preferencia:', message);

    const isConfig = message.startsWith('Falta configurar');
    if (isConfig) console.error(`[MP] Revisar las variables de entorno: ${message}`);

    return NextResponse.json(
      {
        error: isConfig
          ? 'La pasarela de pagos no está configurada. Escribinos y lo resolvemos.'
          : 'No pudimos iniciar el pago. Intentá de nuevo en unos segundos.',
      },
      { status: isConfig ? 500 : 502 },
    );
  }
}