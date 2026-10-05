import { Resend } from 'resend';
import { PRODUCT } from './product';

/**
 * Entrega del ebook por email. Es una función interna, no una ruta HTTP: así
 * nadie puede dispararla desde afuera, y solo la llama el webhook ya validado.
 */

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

export class EbookDeliveryError extends Error {}

type DeliveryParams = {
  email: string;
  /** ID del pago de Mercado Pago. Evita mails duplicados si MP reintenta. */
  paymentId: string | number;
};

export async function sendEbookEmail({ email, paymentId }: DeliveryParams): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new EbookDeliveryError('Falta RESEND_API_KEY.');

  const downloadUrl = process.env.EBOOK_DOWNLOAD_URL;
  if (!downloadUrl) throw new EbookDeliveryError('Falta EBOOK_DOWNLOAD_URL.');

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send(
    {
      from: FROM_EMAIL,
      to: email,
      subject: `Tu ebook "${PRODUCT.title}" está listo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Gracias por tu compra</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Tu ebook <strong>"${PRODUCT.title}"</strong> ya está disponible.
          </p>
          <p style="margin: 28px 0;">
            <a href="${downloadUrl}"
               style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: bold;
                      text-decoration: none; padding: 14px 32px; border-radius: 8px;">
              Descargar el ebook (.zip)
            </a>
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            El archivo está comprimido en ZIP: al descargarlo, descomprimilo para abrir el ebook.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Incluye tus 4 bonos: páginas de venta editables, 100 prompts de ChatGPT,
            Mapa de Propósito y la comunidad privada.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Si tenés cualquier duda, respondé a este email.
          </p>
          <p style="color: #4a4a4a; font-size: 14px; margin-top: 30px;">
            Saludos,<br>
            El equipo
          </p>
        </div>
      `,
    },
    { idempotencyKey: `ebook-${paymentId}` },
  );

  // Resend no lanza excepción ante un rechazo: lo devuelve en `error`.
  if (error) {
    throw new EbookDeliveryError(`Resend rechazó el envío: ${error.message}`);
  }

  return data?.id ?? null;
}
