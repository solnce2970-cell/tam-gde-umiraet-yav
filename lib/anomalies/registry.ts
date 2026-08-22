export const SIGN_IDS = [
  "broken-border",
  "night-nav",
  "memory-or-life",
  "auk-echo",
  "makosh-thread",
  "vladimir-third-track",
  "three-worlds",
  "shishiga-track",
  "morok-stars",
  "semargl-svarog",
  "neveyana-morok",
  "silent-path",
  "return-to-beginning",
] as const;

export type SignId = (typeof SIGN_IDS)[number];

export type SignReward =
  | { kind: "gallery"; id: "makosh-thread" }
  | { kind: "image"; id: "shishiga-track"; src: string; alt: string };

export type SignDefinition = {
  id: SignId;
  active: boolean;
  title: string;
  archiveText: string;
  reward?: SignReward;
  followUp?: {
    question: string;
    href: string;
    options: readonly string[];
  };
};

export const SIGN_REGISTRY: readonly SignDefinition[] = [
  { id: "broken-border", active: true, title: "Нарушенная межа", archiveText: "На одно мгновение слова назвали происходящее иначе." },
  { id: "night-nav", active: true, title: "Навь не спит", archiveText: "Некоторые огни появляются только тогда, когда Явь уже должна спать." },
  { id: "memory-or-life", active: true, title: "Древний договор", archiveText: "Память или жизнь. Один выбор уже сделан." },
  { id: "auk-echo", active: true, title: "Аук услышал", archiveText: "Лес иногда отвечает не с той стороны." },
  {
    id: "makosh-thread",
    active: true,
    title: "Чужая нить Макоши",
    archiveText: "Не всякая нить лежит в руках Макоши.",
    reward: { kind: "gallery", id: "makosh-thread" },
    followUp: {
      question: "Заглянуть в Ларец памяти?",
      href: "/larets-predaniy",
      options: ["Да", "Конечно)"],
    },
  },
  { id: "vladimir-third-track", active: true, title: "Третий след", archiveText: "Два следа складывались в дорогу. Третий выдал того, кто шёл рядом." },
  { id: "three-worlds", active: true, title: "Три песни", archiveText: "Три голоса прозвучали достаточно долго — и легли в единственно верный порядок." },
  {
    id: "shishiga-track",
    active: true,
    title: "След шишиги",
    archiveText: "Иногда след выдаёт тварь раньше, чем лицо.",
    reward: {
      kind: "image",
      id: "shishiga-track",
      src: "/images/navnik/shishiga-shadow.webp",
      alt: "Тень Шишиги, оставившей след пятками вперёд",
    },
  },
  { id: "morok-stars", active: true, title: "Лишняя звезда", archiveText: "В темноте Морока не всё остаётся на своих местах." },
  { id: "semargl-svarog", active: true, title: "Отцовская искра", archiveText: "Некоторый огонь помнит, откуда был высечен." },
  { id: "neveyana-morok", active: true, title: "Белые глаза", archiveText: "Не каждый взгляд принадлежит тому, кто смотрит." },
  { id: "silent-path", active: true, title: "Тихая дорога", archiveText: "Тому, кто не потревожил путь, дорога показалась сама." },
  { id: "return-to-beginning", active: true, title: "Возвращение", archiveText: "Последний знак не лежал дальше остальных. Он ждал в начале." },
] as const;

export const SIGN_COUNT = SIGN_REGISTRY.length;
export const ACTIVE_SIGN_IDS = SIGN_REGISTRY.filter((sign) => sign.active).map((sign) => sign.id);
export const INACTIVE_SIGN_IDS = SIGN_REGISTRY.filter((sign) => !sign.active).map((sign) => sign.id);

const SIGN_ID_SET = new Set<string>(SIGN_IDS);

export function isSignId(value: unknown): value is SignId {
  return typeof value === "string" && SIGN_ID_SET.has(value);
}

export function isActiveSignId(value: unknown): value is SignId {
  return isSignId(value) && ACTIVE_SIGN_IDS.includes(value);
}

export function getSignDefinition(id: SignId): SignDefinition {
  return SIGN_REGISTRY.find((sign) => sign.id === id)!;
}
