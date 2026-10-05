import Script from "next/script";

const GA4_ID = "G-79B507B5NQ";

/**
 * Google tag (gtag.js). Next inyecta el script externo y el config inline con
 * strategy="beforeInteractive" para queMeasurement se registre antes de la
 * hidratacion, igual que el pixel de Meta.
 *
 * Los eventos quedan en window.dataLayer hasta que gtag.js carga, asi que el
 * orden entre el script externo y el inline no es critico.
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="beforeInteractive"
      />
      <Script
        id="google-analytics"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`,
        }}
      />
    </>
  );
}
