import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import path from 'path';
import fs from 'fs/promises';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const EBOOK_FILENAME = 'ebook.zip';
const EBOOK_PATH = path.join(process.cwd(), 'assets', EBOOK_FILENAME);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await fs.readFile(EBOOK_PATH);
    } catch {
      console.error(`[SendEbook] No se encontro el PDF en ${EBOOK_PATH}`);
      return NextResponse.json({ error: 'PDF no encontrado' }, { status: 500 });
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Tu ebook "De la Idea a los Ingresos" esta listo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Gracias por tu compra</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Tu ebook <strong>"De la Idea a los Ingresos + 4 Bonos"</strong> esta adjunto en este email.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Tambien recibiras los 4 bonos: checklist de validacion, plantilla de precios,
            banco de 30 ideas y acceso a la comunidad privada.
          </p>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            Si tienes cualquier duda, responde a este email.
          </p>
          <p style="color: #4a4a4a; font-size: 14px; margin-top: 30px;">
            Saludos,<br>
            El equipo
          </p>
        </div>
      `,
      attachments: [
        {
          filename: EBOOK_FILENAME,
          content: pdfBuffer,
        },
      ],
    });

    console.log(`[SendEbook] Ebook enviado a ${email}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[SendEbook] Error enviando email:', message);
    return NextResponse.json({ error: 'No se pudo enviar el email' }, { status: 500 });
  }
}
