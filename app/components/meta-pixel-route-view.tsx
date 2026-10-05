"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function MetaPixelRouteView() {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (typeof window.fbq === "function") {
      // Sin eventSourceURL Meta atribuye el PageView de una navegacion interna
      // a la URL con la que se cargo el pixel, no a la ruta visitada.
      window.fbq("track", "PageView", { eventSourceURL: window.location.href });
    }
  }, [pathname]);

  return null;
}
