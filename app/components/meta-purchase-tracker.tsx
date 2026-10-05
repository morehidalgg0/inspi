"use client";

import { useEffect } from "react";
import { trackPurchase } from "../lib/meta-pixel";

export function MetaPurchaseTracker({ eventId }: { eventId?: string | null }) {
  useEffect(() => {
    trackPurchase(eventId);
  }, [eventId]);

  return null;
}
