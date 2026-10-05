import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[SendEbook] Falta RESEND_API_KEY.');
      return NextResponse.json({ error: 'Email no configurado' }, { status: 500 });
    }

    const downloadUrl = process.env.EBOOK_DOWNLOAD_URL;
    if (!downloadUrl) {
      console.error('[SendEbook] Falta EBOOK_DOWNLOAD_URL.');
      return NextResponse.json({ error: 'Ebook no disponible' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Tu ebook "De la Idea a los Ingresos" esta listo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Gracias por tu compra</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Tu ebook <strong>"De la Idea a los Ingresos + 4 Bonos"</strong> ya esta disponible.
          </p>
          <p style="margin: 28px 0;">
            <a href="${downloadUrl}"
               style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: bold;
                      text-decoration: none; padding: 14px 32px; border-radius: 8px;">
              Descargar el ebook (.zip)
            </a>
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            El archivo esta comprimido en ZIP: al descargarlo, descomprimilo para abrir el ebook.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Insidios sus 4 bonos: checklist de validacion, plantilla de precios,
            banco de 30 ideas y acceso a la comunidad privada.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Si tenes cualquier duda, responde a este email.
          </p>
          <p style="color: #4a4a4a; font-size: 14px; margin-top: 30px;">
            Saludos,<br>
            El equipo
          </p>
        </div>
      `,
    });

    // Resend no lanza excepcion ante un rechazo: lo devuelve en `error`.
    if (error) {
      console.error(`[SendEbook] Resend rechazo el envio a ${email}: ${error.message}`);
      return NextResponse.json({ error: 'Resend rechazo el envio' }, { status: 502 });
    }

    console.log(`[SendEbook] Ebook enviado a ${email} (id=${data?.id ?? '-'})`);
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[SendEbook] Error enviando email:', message);
    return NextResponse.json({ error: 'No se pudo enviar el email' }, { status: 500 });
  }
}