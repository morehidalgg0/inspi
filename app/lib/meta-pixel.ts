export const META_PIXEL_ID = "2187050011872218";

export const META_PRODUCT = {
  value: 19900,
  currency: "ARS",
  content_name: "De la Idea a los Ingresos + 4 Bonos",
  content_ids: ["ebook-idea-ingresos"],
  content_type: "product",
} as const;

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  window.fbq(...args);
}

export function trackInitiateCheckout() {
  fbq("track", "InitiateCheckout", {
    value: META_PRODUCT.value,
    currency: META_PRODUCT.currency,
    content_name: META_PRODUCT.content_name,
    content_ids: META_PRODUCT.content_ids,
    content_type: META_PRODUCT.content_type,
    num_items: 1,
  });
}

/**
 * Espera a que el pixel vacie su cola antes de navegar.
 *
 * fbq no transmite el evento en el momento del track: lo encola y fbevents.js
 * lo envia despues. Si redirigimos a Mercado Pago en el mismo tick, el
 * navegador cancela el request a facebook.com/tr y el InitiateCheckout se
 * pierde. La cola queda vacia solo cuando fbevents.js ya cargo y entrego todo.
 */
export function flushPixel(timeoutMs = 1000): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;

    const wait = () => {
      if (!window.fbq?.queue?.length || Date.now() >= deadline) {
        resolve();
        return;
      }
      setTimeout(wait, 50);
    };

    wait();
  });
}

export function trackPurchase(eventId?: string | null) {
  const params = {
    value: META_PRODUCT.value,
    currency: META_PRODUCT.currency,
    content_name: META_PRODUCT.content_name,
    content_ids: META_PRODUCT.content_ids,
    content_type: META_PRODUCT.content_type,
    num_items: 1,
  };

  if (eventId) {
    fbq("track", "Purchase", params, { eventID: eventId });
    return;
  }

  fbq("track", "Purchase", params);
}
