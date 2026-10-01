import { NextResponse } from 'next/server';
import { Payment, WebhookSignatureValidator, InvalidWebhookSignatureError } from 'mercadopago';
import { EBOOK, createMpClient, getWebhookSecret } from '../../../lib/mercadopago';

type MpNotification = {
  id?: number | string;
  type?: string;
  action?: string;
  data?: { id?: string };
};

/**
 * Mercado Pago notifica el resultado real del pago. Es la unica fuente
 * confiable: el redirect a /success lo puede cerrar el usuario antes de que el
 * pago se haya acreditado.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('data.id');

  // Evento de prueba manual del panel de MP: no aplica.
  if (paymentId === 'test' || paymentId === 'TEST') {
    return NextResponse.json({ received: true, ignored: 'test-event' });
  }

  if (!paymentId) {
    console.warn('[MP Webhook] Notificacion sin data.id, se ignora.');
    return NextResponse.json({ received: true, ignored: 'missing-data-id' });
  }

  let secret: string;
  try {
    secret = getWebhookSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[MP Webhook] ${message}`);
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get('x-signature'),
      xRequestId: request.headers.get('x-request-id'),
      dataId: paymentId,
      secret,
      toleranceSeconds: 300,
    });
  } catch (error) {
    const reason = error instanceof InvalidWebhookSignatureError ? error.reason : 'desconocido';
    console.warn(`[MP Webhook] Firma invalida (${reason}), se rechaza.`);
    return NextResponse.json({ error: 'Firma invalida' }, { status: 401 });
  }

  let notification: MpNotification = {};
  try {
    notification = JSON.parse(rawBody) as MpNotification;
  } catch {
    console.warn('[MP Webhook] Payload no es JSON valido.');
  }

  if (notification.type !== 'payment') {
    console.log(`[MP Webhook] Evento ignorado: ${notification.type}/${notification.action}`);
    return NextResponse.json({ received: true, ignored: notification.type ?? 'unknown' });
  }

  try {
    const payment = await new Payment(createMpClient()).get({ id: Number(paymentId) });

    const isApproved = payment.status === 'approved';
    const amountMatches = payment.transaction_amount === EBOOK.unitPrice;
    const email = payment.payer?.email ?? 'sin-email';

    console.log(
      `[MP Webhook] pago=${payment.id} estado=${payment.status} detalle=${payment.status_detail} monto=${payment.transaction_amount} ref=${payment.external_reference ?? '-'} email=${email}`,
    );

    if (!amountMatches) {
      console.error(
        `[MP Webhook] Monto inesperado en el pago ${payment.id}: ${payment.transaction_amount} (esperado ${EBOOK.unitPrice}).`,
      );
      return NextResponse.json({ received: true, ignored: 'amount-mismatch' });
    }

    if (isApproved) {
      // Aca va la entrega del ebook: enviar el archivo o el link de descarga
      // al email del comprador y registrar la venta.
      console.log(`[MP Webhook] Venta confirmada. Entregar ebook a ${email}.`);
    }

    return NextResponse.json({ received: true, status: payment.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[MP Webhook] No se pudo consultar el pago ${paymentId}:`, message);
    // 500 para que Mercado Pago reintente la notificacion.
    return NextResponse.json({ error: 'No se pudo procesar la notificacion' }, { status: 500 });
  }
}