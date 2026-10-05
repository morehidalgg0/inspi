import { NextResponse } from 'next/server';
import { Payment, WebhookSignatureValidator, InvalidWebhookSignatureError } from 'mercadopago';
import { EBOOK, createMpClient, getWebhookSecret } from '../../../lib/mercadopago';
import { sendEbookEmail } from '../../../lib/ebook-delivery';

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

    // El email que el cliente escribio en la landing viaja en metadata y no es
    // alterado por MercadoPago. payer.email es el fallback: si el comprador
    // estaba logueado, MP lo reemplaza por el de su cuenta.
    const email = payment.metadata?.delivery_email ?? payment.payer?.email ?? null;

    console.log(
      `[MP Webhook] pago=${payment.id} estado=${payment.status} detalle=${payment.status_detail} monto=${payment.transaction_amount} ref=${payment.external_reference ?? '-'} email=${email ?? 'sin-email'}`,
    );

    if (!amountMatches) {
      console.error(
        `[MP Webhook] Monto inesperado en el pago ${payment.id}: ${payment.transaction_amount} (esperado ${EBOOK.unitPrice}).`,
      );
      return NextResponse.json({ received: true, ignored: 'amount-mismatch' });
    }

    // 500 para que MercadoPago reintente: sin email no hay entrega posible.
    if (isApproved && !email) {
      console.error(`[MP Webhook] El pago ${payment.id} no tiene email para entregar el ebook.`);
      return NextResponse.json({ error: 'Pago aprobado sin email de entrega' }, { status: 500 });
    }

    if (isApproved && email) {
      try {
        // La clave de idempotencia usa el id del pago: si MP notifica varias
        // veces el mismo pago (o reintentamos), el cliente recibe un solo mail.
        const emailId = await sendEbookEmail({ email, paymentId: payment.id ?? paymentId });
        console.log(`[MP Webhook] Ebook enviado a ${email} (id=${emailId ?? '-'})`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`[MP Webhook] Fallo el envio del ebook a ${email}: ${message}`);
        // 500 para que Mercado Pago reintente: el cliente ya pagó y no puede
        // quedarse sin ebook por un error pasajero de Resend.
        return NextResponse.json({ error: 'No se pudo entregar el ebook' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true, status: payment.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[MP Webhook] No se pudo consultar el pago ${paymentId}:`, message);
    // 500 para que Mercado Pago reintente la notificacion.
    return NextResponse.json({ error: 'No se pudo procesar la notificacion' }, { status: 500 });
  }
}