"use client";

import { useEffect, useState } from "react";
import SecretArchive from "./za-mezhoy/SecretArchive";
import { EMPTY_ANOMALY_STATE, readAnomalyState, subscribeAnomalyStore, type AnomalyState } from "../lib/anomalies/store";

export default function FinalSecretText() {
  const [state, setState] = useState<AnomalyState>(EMPTY_ANOMALY_STATE);

  useEffect(() => {
    const sync = () => setState(readAnomalyState());
    sync();
    return subscribeAnomalyStore(sync);
  }, []);

  return <SecretArchive state={state} />;
}
