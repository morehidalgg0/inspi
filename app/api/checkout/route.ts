import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST() {
  try {
    // Verificamos si existe el token (lo pondremos en el archivo .env luego)
    if (!process.env.MP_ACCESS_TOKEN) {
      console.warn("ADVERTENCIA: Falta el MP_ACCESS_TOKEN. Para pruebas, devolveremos un error.");
      return NextResponse.json({ error: "Falta configurar el Token de Mercado Pago" }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'ebook-idea-ingresos',
            title: 'De la Idea a los Ingresos + 4 Bonos',
            quantity: 1,
            unit_price: 19900,
            currency_id: 'ARS',
          }
        ],
        back_urls: {
          success: 'https://inspiraciondiaria.net/success',
          failure: 'https://inspiraciondiaria.net/failure',
          pending: 'https://inspiraciondiaria.net/pending'
        },
        auto_return: 'approved',
      }
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error("Error creando la preferencia de MP:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
