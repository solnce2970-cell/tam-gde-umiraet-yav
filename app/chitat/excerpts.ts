export type ReadingItem = {
  slug: string;
  title: string;
  kicker: string;
  mood: string;
  time: string;
  intro: string;
  relatedLabel?: string;
  relatedHref?: string;
  kind: "chapter" | "excerpt";
};

export const readingItems: ReadingItem[] = [
  {
    slug: "glava-1",
    title: "Глава 1. Начало",
    kicker: "Начать читать подряд",
    mood: "полная глава",
    time: "время уточним",
    intro: "Для тех, кто хочет войти в историю с первой страницы.",
    kind: "chapter",
  },
  {
    slug: "pamyat-ili-zhizn",
    title: "Память или жизнь",
    kicker: "Глава 0 · Гора Забвения",
    mood: "тревога",
    time: "≈ 4 минуты",
    intro: "Камни Семаргла защищают от нечисти. Гора берёт за них память. Но однажды человек вспомнил имя.",
    kind: "excerpt",
  },
  {
    slug: "zrya-ty-ee-spas",
    title: "Зря ты её спас",
    kicker: "Глава 2 · Лесные тропы",
    mood: "нечисть",
    time: "≈ 3 минуты",
    intro: "Ауки любят морочить путников. Но в этот раз один из них пришёл не заманивать. А предупредить.",
    relatedLabel: "Кто такой Аук? → Навник",
    relatedHref: "/#navnik",
    kind: "excerpt",
  },
  {
    slug: "les-prishel-k-ney-sam",
    title: "Лес пришёл к ней сам",
    kicker: "Глава 7 · Свет во Тьме",
    mood: "свет",
    time: "≈ 4 минуты",
    intro: "Она не сказала Владимиру ни слова. Но зверям слова были не нужны.",
    relatedLabel: "Светояра → Герои",
    relatedHref: "/#characters",
    kind: "excerpt",
  },
  {
    slug: "son-kotoryy-byl-ne-ego",
    title: "Сон, который был не его",
    kicker: "Глава 9 · Сны о прошлом",
    mood: "Навь и боги",
    time: "≈ 4 минуты",
    intro: "Владимир уснул. И увидел чужую память — Навь, огонь и того, кто когда-то родился из искры.",
    relatedLabel: "Семаргл → Лики богов",
    relatedHref: "/genealogy#gods-title",
    kind: "excerpt",
  },
  {
    slug: "slishkom-blizko",
    title: "Слишком близко",
    kicker: "Глава 10 · Пепел утра",
    mood: "чувства",
    time: "≈ 4 минуты",
    intro: "Они слишком долго делали вид, что между ними ничего не происходит. Однажды расстояния не осталось.",
    kind: "excerpt",
  },
  {
    slug: "koshka-kotoruyu-nikto-ne-prosil-govorit",
    title: "Кошка, которую никто не просил говорить",
    kicker: "Глава 11 · Ведьмина подручница",
    mood: "язвительность",
    time: "≈ 3 минуты",
    intro: "У Огнеяры есть кошка. Она разговаривает. И почти всегда — не вовремя.",
    relatedLabel: "Огнеяра → Герои",
    relatedHref: "/#characters",
    kind: "excerpt",
  },
  {
    slug: "dom-kotoryy-gulyal",
    title: "Дом, который гулял сам по себе",
    kicker: "Глава 15",
    mood: "немного безумия",
    time: "≈ 3 минуты",
    intro: "Дом Огнеяры стоит на курьих ногах. Поэтому иногда его приходится искать по лесу.",
    kind: "excerpt",
  },
];

export function getReadingItem(slug: string) {
  return readingItems.find((item) => item.slug === slug);
}
