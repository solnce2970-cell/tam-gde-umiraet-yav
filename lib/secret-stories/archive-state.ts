"use client";

import { SECRET_STORY_IDS, type SecretStoryId } from "./index";

const SECRET_ARCHIVE_KEY = "yav-secret-archive-v1";
const SECRET_ARCHIVE_EVENT = "yav:secret-archive-change";

export type SecretArchiveState = {
  opened: SecretStoryId[];
  otherSideUnlocked: boolean;
};

export const EMPTY_SECRET_ARCHIVE_STATE: SecretArchiveState = {
  opened: [],
  otherSideUnlocked: false,
};

function storage(): Storage | null {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}

function sanitize(value: unknown): SecretArchiveState {
  const parsed = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const allowed = new Set<string>(SECRET_STORY_IDS);
  const opened = Array.isArray(parsed.opened)
    ? Array.from(new Set(parsed.opened.filter((id): id is SecretStoryId => typeof id === "string" && allowed.has(id))))
    : [];
  return { opened, otherSideUnlocked: parsed.otherSideUnlocked === true };
}

export function readSecretArchiveState(): SecretArchiveState {
  const target = storage();
  if (!target) return EMPTY_SECRET_ARCHIVE_STATE;
  try {
    const raw = target.getItem(SECRET_ARCHIVE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : EMPTY_SECRET_ARCHIVE_STATE;
  } catch {
    return EMPTY_SECRET_ARCHIVE_STATE;
  }
}

function write(next: SecretArchiveState): SecretArchiveState {
  const clean = sanitize(next);
  const target = storage();
  try { target?.setItem(SECRET_ARCHIVE_KEY, JSON.stringify(clean)); } catch {}
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SECRET_ARCHIVE_EVENT));
  return clean;
}

export function markSecretStoryOpened(id: SecretStoryId): SecretArchiveState {
  const current = readSecretArchiveState();
  if (current.opened.includes(id)) return current;
  return write({ ...current, opened: [...current.opened, id] });
}

export function unlockSecretOtherSide(): SecretArchiveState {
  const current = readSecretArchiveState();
  if (current.otherSideUnlocked) return current;
  return write({ ...current, otherSideUnlocked: true });
}

export function subscribeSecretArchive(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === SECRET_ARCHIVE_KEY) listener();
  };
  window.addEventListener(SECRET_ARCHIVE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SECRET_ARCHIVE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
