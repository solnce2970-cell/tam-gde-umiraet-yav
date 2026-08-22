import type { AnomalyState } from "./store.ts";
import type { SignId } from "./registry.ts";

export const ANOMALY_STORE_EVENT = "yav:anomaly-store-change";
export const LEGACY_ANOMALY_FOUND_EVENT = "yav:anomaly-found";
export const NAVNIK_TRANSITION_EVENT = "yav:navnik-transition";
export const MEZHA_FORCE_EVENT = "yav:mezha-force";
export const SIGN_REVEAL_REQUEST_EVENT = "yav:sign-reveal-request";
export const SIGN_REVEAL_COMPLETE_EVENT = "yav:sign-reveal-complete";
export const VLADIMIR_TRACK_FORCE_EVENT = "yav:vladimir-track-force";
export const SEMARGL_SPARK_FORCE_EVENT = "yav:semargl-spark-force";
export const SILENT_PATH_FORCE_EVENT = "yav:silent-path-force";
export const RETURN_CRACK_FORCE_EVENT = "yav:return-crack-force";

export type NavnikTransitionDetail = {
  creatureId: string;
  transition: "closed-to-open" | "open-to-closed";
};

export type AnomalyStoreEventDetail = {
  id?: SignId;
  state?: AnomalyState;
  unlocked?: true;
};
