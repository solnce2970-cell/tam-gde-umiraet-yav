"use client";

import { useSyncExternalStore } from "react";
import { readAnomalyState, subscribeAnomalyStore } from "../lib/anomalies/store";

export default function BeyondFooterLink() {
  const unlocked = useSyncExternalStore(
    subscribeAnomalyStore,
    () => readAnomalyState().beyondUnlocked,
    () => false,
  );

  return unlocked ? <a href="/za-mezhoy">За Межой</a> : null;
}
