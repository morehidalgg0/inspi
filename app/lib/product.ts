/**
 * Fuente única de verdad del producto. La usan el checkout, el webhook, el
 * pixel de Meta y la landing: si cambiás el precio acá, cambia en todos lados.
 *
 * No importa el SDK de Mercado Pago a propósito, para que se pueda usar también
 * desde componentes de cliente sin sumar el SDK al bundle del navegador.
 */
export const PRODUCT = {
  id: 'ebook-idea-ingresos',
  title: 'De la Idea a los Ingresos + 4 Bonos',
  description:
    'Ebook digital con 4 bonos: páginas de venta editables, 100 prompts de ChatGPT, Mapa de Propósito y comunidad privada.',
  quantity: 1,
  unitPrice: 1000,
  currencyId: 'ARS',
  statementDescriptor: 'DE LA IDEA A INGRESOS', // maximo 22 caracteres en MP
} as const;

/** 19900 -> "19.900". Manual para que servidor y navegador rendericen igual. */
export function formatPrice(amount: number): string {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
