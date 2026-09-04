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
    intro: "Для тех, кто хочет войти в историю с первой страницы и читать без прыжков по настроениям.",
    kind: "chapter",
  },
  {
    slug: "pamyat-ili-zhizn",
    title: "Память или жизнь",
    kicker: "Гора Забвения",
    mood: "мрачно",
    time: "≈ 4 минуты",
    intro: "Камни Семаргла защищают людей от нечисти. За каждый из них Гора берёт память. Но однажды она потребовала больше.",
    kind: "excerpt",
  },
  {
    slug: "sol-dolzhna-byla-ostanovit",
    title: "Соль должна была её остановить",
    kicker: "Сухой бор",
    mood: "страшно",
    time: "≈ 3 минуты",
    intro: "Старые заговоры работали всегда. Пока однажды не перестали.",
    kind: "excerpt",
  },
  {
    slug: "auk-znaet-bolshe",
    title: "Аук знает больше, чем говорит",
    kicker: "Лесные тропы",
    mood: "тайна",
    time: "≈ 3 минуты",
    intro: "Обычно он заманивал. Иногда смеялся. В этот раз — предупредил.",
    relatedLabel: "Открыть Аука в Навнике",
    relatedHref: "/#navnik",
    kind: "excerpt",
  },
  {
    slug: "ta-k-kotoroy-prihodit-les",
    title: "Та, к которой приходит лес",
    kicker: "Светояра",
    mood: "светло",
    time: "≈ 4 минуты",
    intro: "Она не сказала ни слова. Лес всё равно её услышал.",
    relatedLabel: "Вернуться к героям",
    relatedHref: "/#characters",
    kind: "excerpt",
  },
  {
    slug: "vedma-ne-smogla-smenit-litso",
    title: "Ведьма не смогла сменить лицо",
    kicker: "Огнеяра",
    mood: "мистика",
    time: "≈ 4 минуты",
    intro: "Это была самая простая её хитрость. В этот раз Явь не позволила.",
    relatedLabel: "Слушать музыку мира",
    relatedHref: "/#music",
    kind: "excerpt",
  },
  {
    slug: "dom-kotoryy-gulyal",
    title: "Дом, который гулял сам по себе",
    kicker: "Из романа бывает и такое",
    mood: "немного безумия",
    time: "≈ 3 минуты",
    intro: "Живая избушка, обидчивый характер, Аук, Душница и очень условное понятие недвижимости.",
    kind: "excerpt",
  },
  {
    slug: "moey-niti-tam-net",
    title: "Моей нити там нет",
    kicker: "Правь",
    mood: "тайна",
    time: "≈ 2 минуты",
    intro: "Если даже Макошь не знает, кто прял эту нить, значит вопрос уже не только в одном человеке.",
    relatedLabel: "Открыть Лики богов",
    relatedHref: "/genealogy#gods-title",
    kind: "excerpt",
  },
];

export function getReadingItem(slug: string) {
  return readingItems.find((item) => item.slug === slug);
}
