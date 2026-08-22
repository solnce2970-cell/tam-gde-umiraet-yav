"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ANOMALY_STORE_EVENT,
  SIGN_REVEAL_COMPLETE_EVENT,
  type AnomalyStoreEventDetail,
} from "../lib/anomalies/events";
import { getSignDefinition, isActiveSignId, type SignId } from "../lib/anomalies/registry";
import styles from "./sign-found-reveal.module.css";

type Phase = "reveal" | "follow-up";

export default function SignFoundReveal() {
  const [queue, setQueue] = useState<SignId[]>([]);
  const [phase, setPhase] = useState<Phase>("reveal");
  const cardRef = useRef<HTMLElement | null>(null);
  const primaryRef = useRef<HTMLElement | null>(null);
  const originRef = useRef<HTMLElement | null>(null);
  const current = queue[0];
  const sign = current ? getSignDefinition(current) : null;

  useEffect(() => {
    const onStoreChange = (event: Event) => {
      const id = (event as CustomEvent<AnomalyStoreEventDetail>).detail?.id;
      if (!isActiveSignId(id)) return;
      setQueue((items) => items.includes(id) ? items : [...items, id]);
    };
    window.addEventListener(ANOMALY_STORE_EVENT, onStoreChange);
    return () => window.removeEventListener(ANOMALY_STORE_EVENT, onStoreChange);
  }, []);

  const complete = useCallback(() => {
    if (!current) return;
    window.dispatchEvent(new CustomEvent(SIGN_REVEAL_COMPLETE_EVENT, { detail: { id: current } }));
    setQueue((items) => items.slice(1));
    setPhase("reveal");
  }, [current]);

  const advance = useCallback(() => {
    if (phase === "reveal" && sign?.followUp) {
      setPhase("follow-up");
      return;
    }
    complete();
  }, [complete, phase, sign?.followUp]);

  useEffect(() => {
    if (!current) return;
    setPhase("reveal");
  }, [current]);

  useEffect(() => {
    if (current && !originRef.current) {
      originRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      return;
    }
    if (!current && originRef.current) {
      originRef.current.focus({ preventScroll: true });
      originRef.current = null;
    }
  }, [current]);

  useEffect(() => {
    if (!current) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = phase === "reveal" ? window.setTimeout(advance, 3000) : undefined;
    const focusTimer = window.setTimeout(() => primaryRef.current?.focus({ preventScroll: true }), 30);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        advance();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        cardRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? [],
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (timer) window.clearTimeout(timer);
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [advance, current, phase]);

  if (!sign) return null;

  return (
    <div className={styles.overlay} role="presentation" data-sign-found-reveal={sign.id}>
      <section
        ref={cardRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-live="assertive"
        aria-labelledby="sign-found-title"
      >
        {phase === "reveal" ? (
          <>
            <p>Знак Межи найден</p>
            <h2 id="sign-found-title">{sign.title}</h2>
            <button ref={(node) => { primaryRef.current = node; }} type="button" onClick={advance}>
              Продолжить
            </button>
          </>
        ) : (
          <>
            <p>Память открыта</p>
            <h2 id="sign-found-title">{sign.followUp?.question}</h2>
            <div className={styles.actions}>
              {sign.followUp?.options.map((label, index) => (
                <a
                  key={label}
                  ref={index === 0 ? (node) => { primaryRef.current = node; } : undefined}
                  href={sign.followUp?.href}
                  onClick={complete}
                >
                  {label}
                </a>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
